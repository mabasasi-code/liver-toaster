import { VideoStore, YoutubeAPI } from "../../bootstrap";
import VideoInterface from "../interface/database/VideoInterface";
import Tweeter from "../util/Tweeter";
import ArrayToObject from "../util/ArrayToObject";
import { Logger } from "log4js";

// TODO: まとめたい
export default class VideoProcess {
  protected logger: Logger
  protected force: boolean

  constructor (logger: Logger, force: boolean = false) {
    this.logger = logger
    this.force = force
  }

  public async normalize() {
    this.logger.info('> db normalize')

    // 全データを取得する
  }

  public async updateByVideos(videos: VideoInterface[]) {
    if (!videos || videos.length === 0) throw new ReferenceError('No video IDs')

    const videoIds = videos.map(e => e.videoId)

    await this.update(videoIds, videos)
  }

  public async updateById(videoId: string) {
    if (!videoId) throw new ReferenceError('No video ID')

    const dbVideo = await VideoStore.findOne({ videoId: videoId })
    const dbVideos = dbVideo ? [dbVideo] : null

    await this.update([videoId], dbVideos)
  }

  /// /////

  protected async update(videoIds: string[], videos: VideoInterface[] = null) {
    this.logger.info('> videoIds: ' + JSON.stringify(videoIds))

    // api を叩く (return map)
    const apiVideos = await YoutubeAPI.fetchVideoList(videoIds)
    if (!apiVideos) {
      throw new Error('api failure')
    }

    // dbVideo の map を生成する
    const dbVideos = ArrayToObject<VideoInterface>(videoIds, videos, (e) => e.videoId)

    // 値を結合する (DB <<= API)
    // TODO: 削除処理
    const mergeVideos = videoIds.map(videoId => {
      const db = dbVideos[videoId]
      const api = apiVideos[videoId] || null
      const merge = VideoStore.attachAPIValue(db, api) // null なら新規作成される
      return merge
    })

    // それぞれの処理
    for (const mergeVideo of mergeVideos) {
      this.logger.trace('> videoId: ' + mergeVideo.videoId)
      // 通知などを実行
      const resVideo = await this.videoNotify(mergeVideo)

      // DB に保存
      await VideoStore.upsert(resVideo)
    }

    this.logger.debug('> success!')
  }

  protected async videoNotify(video: VideoInterface) {
    // 配信が始まってなくて、予定ツイをしてなさそうならする
    if (!video.actualStartTime && !video.actualEndTime) {
      this.logger.debug(`> [${video.videoId}] schedule stream (tweet: ${video.notifySchedule})`)
      if (!video.notifySchedule || this.force) {
        await Tweeter.scheduleStreaming(video)
        video.notifySchedule = true
      }
    }

    // 配信中で、開始ツイをしてなさそうならする
    if (video.actualStartTime && !video.actualEndTime) {
      this.logger.debug(`> [${video.videoId}] live streaming (tweet: ${video.notifyStart})`)
      if (!video.notifyStart || this.force) {
        await Tweeter.startLiveStreaming(video)
        video.notifyStart = true
      }
    }

    // 配信が終わってて、終了ツイをしてなさそうならする
    if (video.actualStartTime && video.actualEndTime) {
      this.logger.debug(`> [${video.videoId}] archive stream (tweet: ${video.notifyEnd})`)
      if (!video.notifyEnd || this.force) {
        await Tweeter.endLiveStreaming(video)
        video.notifyEnd = true
      }
    }

    return video
  }
}
