import { VideoStore, YoutubeAPI } from "../../bootstrap";
import VideoInterface from "../interface/database/VideoInterface";
import { Log } from "../../logger/Logger";
import Tweeter from "../util/Tweeter";
import ArrayToObject from "../util/ArrayToObject";

// TODO: まとめたい
export default class VideoProcess {
  public static async processByVideos(videos: VideoInterface[]) {
    if (!videos || videos.length === 0) throw new ReferenceError('No video IDs')

    const videoIds = videos.map(e => e.videoId)

    await this.exec(videoIds, videos)
  }

  public static async processById(videoId: string) {
    if (!videoId) throw new ReferenceError('No video ID')

    const dbVideo = await VideoStore.findOne({ videoId: videoId })
    const dbVideos = dbVideo ? [dbVideo] : null

    await this.exec([videoId], dbVideos)
  }

  ///

  protected static async exec(videoIds: string[], videos?: VideoInterface[] ) {
    Log.info('> videoIds: ' + JSON.stringify(videoIds))

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
      Log.trace('> videoId: ' + mergeVideo.videoId)
      // 通知などを実行
      const resVideo = await this.videoNotify(mergeVideo)

      // DB に保存
      await VideoStore.upsert(resVideo)
    }

    Log.debug('> success!')
  }

  protected static async videoNotify(video: VideoInterface, force: boolean = false) {
    // 配信が始まってなくて、予定ツイをしてなさそうならする
    if (!video.actualStartTime && !video.actualEndTime) {
      Log.debug(`> [${video.videoId}] schedule stream (tweet: ${video.notifySchedule})`)
      if (!video.notifySchedule || force) {
        await Tweeter.scheduleStreaming(video)
        video.notifySchedule = true
      }
    }

    // 配信中で、開始ツイをしてなさそうならする
    if (video.actualStartTime && !video.actualEndTime) {
      Log.debug(`> [${video.videoId}] live streaming (tweet: ${video.notifyStart})`)
      if (!video.notifyStart || force) {
        await Tweeter.startLiveStreaming(video)
        video.notifyStart = true
      }
    }

    // 配信が終わってて、終了ツイをしてなさそうならする
    if (video.actualStartTime && video.actualEndTime) {
      Log.debug(`> [${video.videoId}] archive stream (tweet: ${video.notifyEnd})`)
      if (!video.notifyEnd || force) {
        await Tweeter.endLiveStreaming(video)
        video.notifyEnd = true
      }
    }

    return video
  }
}
