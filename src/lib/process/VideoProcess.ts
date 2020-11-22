import { VideoStore, YoutubeAPI } from "../../Bootstrap";
import VideoInterface from "../interface/database/VideoInterface";
import { Log } from "../../logger/Logger";
import Tweeter from "../util/Tweeter";

export default class VideoProcess {
  public static async exec(videoId: string) {
    Log.info('videoId: ' + videoId)
    if (!videoId) {
      throw new ReferenceError('No video ID')
    }

    // video を db から取り出す (nullable)
    const dbVideo = await VideoStore.findOne(videoId)
    Log.debug('> db: ' + (dbVideo !== null))

    // api を叩く
    const apiVideo = await YoutubeAPI.fetchVideo(videoId)
    Log.debug('> api: ' + (dbVideo !== null))
    if (!apiVideo) {
      // TODO: 動画が削除されているかも
      throw new Error('api failure')
    }

    // 値を結合する (DB <<= API)
    const mergeVideo = VideoStore.attachAPIValue(dbVideo, apiVideo)

    // 通知など実行
    const resVideo = await this.videoHandler(mergeVideo)

    // DB に保存する
    await VideoStore.upsert(resVideo)
    Log.debug('> success!')
  }

  ///

  protected static async videoHandler(video: VideoInterface) {
    // 配信が始まってなくて、予定ツイをしてなさそうならする
    if (!video.actualStartTime && !video.actualEndTime) {
      if (video.notifySchedule) {
        Log.debug('> already schedule tweet')
      } else {
        await Tweeter.scheduleStreaming(video)
        video.notifySchedule = true
      }
    }

    // 配信中で、開始ツイをしてなさそうならする
    if (video.actualStartTime && !video.actualEndTime) {
      if (video.notifyStart) {
        Log.debug('> already start tweet')
      } else {
        await Tweeter.startLiveStreaming(video)
        video.notifyStart = true
      }
    }

    // 配信が終わってて、終了ツイをしてなさそうならする
    if (video.actualStartTime && video.actualEndTime) {
      if (video.notifyEnd) {
        Log.debug('> already end tweet')
      } else {
        await Tweeter.endLiveStreaming(video)
        video.notifyEnd = true
      }
    }

    return video
  }
}
