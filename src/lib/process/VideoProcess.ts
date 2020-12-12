import { VideoStore, YoutubeAPI } from "../../bootstrap";
import VideoInterface from "../interface/database/VideoInterface";
import Tweeter from "../util/Tweeter";
import ArrayToObject from "../util/ArrayToObject";
import { Logger } from "log4js";
import { mapSeries } from "p-iteration";
import DeleteVideoInterface from "../interface/database/DeleteVideoInterface";

export default class VideoProcess {
  protected logger: Logger

  constructor (logger: Logger) {
    this.logger = logger
  }

  public async updateById(videoId: string) {
    return await this.updateByIds([videoId])
  }

  public async updateByIds(videoIds: string[]) {
    if (!videoIds) throw new ReferenceError('No video IDs')

    const dbVideos = await mapSeries(videoIds, async (id) => {
      const video = await VideoStore.findOne({ videoId: id })
      return video
    })
    await this.update(videoIds, dbVideos)
  }

  public async updateByVideos(videos: VideoInterface[]) {
    if (!videos || videos.length === 0) throw new ReferenceError('No video IDs')

    const videoIds = videos.map(e => e.videoId)
    await this.update(videoIds, videos)
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
    const mergeVideos = videoIds.map(videoId => {
      const db = dbVideos[videoId] || null // null なら db に存在しない
      const api = apiVideos[videoId] || null // null なら動画が無い or 削除

      // 削除時処理 (db にあるかで処理が変わる)
      if (!api) {
        if (db) {
          db.deletedAt = new Date()
          return db
        }
        return { videoId: videoId, deletedAt: new Date(), isDelete: true } // 削除用スタブ
      }

      const merge = VideoStore.attachAPIValue(db, api) // null なら新規作成される
      merge.deletedAt = null // 削除フラグを消しとく
      return merge
    })
    // end 値結合 //////////

    // それぞれの処理
    for (const mergeVideo of mergeVideos) {
      this.logger.trace('> videoId: ' + mergeVideo.videoId)

      // 通知などを実行
      if ('isDelete' in mergeVideo || mergeVideo.deletedAt) {
        const res = await this.videoRemove(mergeVideo)
      } else {
        const res = await this.videoNotify(mergeVideo)
      }
    }

    this.logger.debug('> success!')
  }

  ///

  protected async videoRemove(video: VideoInterface | DeleteVideoInterface) {
    // もし削除されてたらDBから消す
    if (video.deletedAt) {
      const hasDB = ('_id' in video && video._id)
      this.logger.debug(`> [${video.videoId}] Deleted video (DB: ${hasDB})`)
      // 通知は今のとこ off
      if ('_id' in video) {
        return await VideoStore.upsert(video) // 削除されたことを記録しておく
      }
    }

    return video
  }

  protected async videoNotify(video: VideoInterface) {
    // 配信が始まってなくて、予定ツイをしてなさそうならする
    if (!video.actualStartTime && !video.actualEndTime) {
      this.logger.debug(`> [${video.videoId}] schedule stream (tweet: ${video.notifySchedule})`)
      if (!video.notifySchedule) {
        await Tweeter.scheduleStreaming(video)
        video.notifySchedule = true
        return await VideoStore.upsert(video)
      }
    }

    // 配信中で、開始ツイをしてなさそうならする
    if (video.actualStartTime && !video.actualEndTime) {
      this.logger.debug(`> [${video.videoId}] live streaming (tweet: ${video.notifyStart})`)
      if (!video.notifyStart) {
        await Tweeter.startLiveStreaming(video)
        video.notifyStart = true
        return await VideoStore.upsert(video)
      }
    }

    // 配信が終わってて、終了ツイをしてなさそうならする
    // ただし、一度でも呟いたもののみ！！
    if (video.actualStartTime && video.actualEndTime) {
      this.logger.debug(`> [${video.videoId}] archive stream (tweet: ${video.notifyEnd})`)
      if (!video.notifyEnd) {
        const isTweeted = video.notifySchedule || video.notifyStart // 一度呟いてるか
        if (!isTweeted) {
          this.logger.debug(`> Skip because it is already over`)
        }

        await Tweeter.endLiveStreaming(video, !isTweeted) // 一度も呟いてなかったらサイレント
        video.notifyEnd = true
        return await VideoStore.upsert(video)
      }
    }

    return video
  }
}
