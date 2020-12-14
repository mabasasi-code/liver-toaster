
import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm'
import Tweeter from '../lib/util/Tweeter'
import { EventLog } from '../logger/Logger'
import Video from '../model/Video'

@EventSubscriber()
export default class VideoSubscriber implements EntitySubscriberInterface<Video> {
  listenTo () {
    return Video
  }

  async beforeInsert (event: InsertEvent<Video>) {
    await VideoSubscriber.process(event.entity)
  }

  async beforeUpdate (event: UpdateEvent<Video>) {
    if (this.simpleUpdateColumns(event).length > 0) {
      await VideoSubscriber.process(event.entity, event.databaseEntity)
    }
  }

  ///

  protected simpleUpdateColumns (event: UpdateEvent<any>) {
    return event.updatedColumns
      .filter(e => !(e.isObjectId || e.isCreateDate || e.isUpdateDate || e.isDeleteDate))
  }

  public static async process(video: Video, dbVideo?: Video) {
    // 参照渡しなので、値も更新される
    // この event の error は失敗してもスルーする
    try {
      await this.videoNotify(video)
    } catch (err) {
      EventLog.error(err)
    }
  }

  ///

  public static async videoNotify(video: Video) {
    // 配信が始まってなくて、予定ツイをしてなさそうならする
    if (!video.actualStartTime && !video.actualEndTime) {
      EventLog.debug(`> [${video.videoId}] schedule stream (tweet: ${Boolean(video.scheduleTweetId)})`)
      if (!video.scheduleTweetId) {
        const tweet = await Tweeter.builder().scheduleStreaming(video)
        video.scheduleTweetId = tweet.id_str
      }
      return
    }

    // 配信中で、開始ツイをしてなさそうならする
    if (video.actualStartTime && !video.actualEndTime) {
      EventLog.debug(`> [${video.videoId}] live streaming (tweet: ${Boolean(video.startTweetId)})`)
      if (!video.startTweetId) {
        const tweet = await Tweeter.builder().startLiveStreaming(video)
        video.startTweetId = tweet.id_str
      }
      return
    }

    // 配信が終わってて、終了ツイをしてなさそうならする
    if (video.actualStartTime && video.actualEndTime) {
      EventLog.debug(`> [${video.videoId}] archive stream (tweet: ${Boolean(video.endTweetId)})`)
      // ただし、開始ツイをしたもののみ
      if (!video.startTweetId) {
        EventLog.warn(`> [${video.videoId}] Skip because there is no start tweet`)
        video.endTweetId = '0' // ダミーを代入
      }

      if (!video.endTweetId) {
        const tweet = await Tweeter.builder().endLiveStreaming(video)
        video.endTweetId = tweet.id_str
      }
      return
    }
  }
}
