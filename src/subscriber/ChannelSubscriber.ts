import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm'
import Tweeter from '../lib/util/Tweeter'
import { EventLog } from '../logger/Logger'
import Channel from '../model/Channel'

@EventSubscriber()
export default class VideoSubscriber implements EntitySubscriberInterface<Channel> {
  listenTo () {
    return Channel
  }

  async beforeInsert (event: InsertEvent<Channel>) {
    await VideoSubscriber.process(event.entity)
  }

  async beforeUpdate (event: UpdateEvent<Channel>) {
    if (this.simpleUpdateColumns(event).length > 0) {
      await VideoSubscriber.process(event.entity, event.databaseEntity)
    }
  }

  ///

  protected simpleUpdateColumns (event: UpdateEvent<any>) {
    return event.updatedColumns
      .filter(e => !(e.isObjectId || e.isCreateDate || e.isUpdateDate || e.isDeleteDate))
  }

  public static async process(channel: Channel, dbChannel?: Channel) {
    // 参照渡しなので、値も更新される
    // この event の error は失敗してもスルーする
    try {
      await this.channelAchivement(channel)
    } catch (err) {
      EventLog.error(err)
    }
  }

  ///

  public static async channelAchivement(channel: Channel, dbChannel?: Channel) {
    const fund = 1000 // 通知ベース

    const nowSubsc = channel.subscriberCount
    const notifySubsc = channel.achivementSubscriber || 0 // 通知した登録者数

    // 通知してない数字になったら通知
    if (nowSubsc >= notifySubsc + fund) {
      const over = nowSubsc % fund // 差分を取得
      const achiveSubsc = nowSubsc - over // 通知する登録者数

      channel.achivementSubscriber = achiveSubsc
      EventLog.debug(`> [${channel.channelId}] Achivement subscriber ${notifySubsc} => ${achiveSubsc} (fund: ${fund})`)

      // 今まで通知したことが無かったらしない
      if (notifySubsc > 0) {
        await Tweeter.builder().achiveChannelOfSubscriber(channel, achiveSubsc)
      }
    }

    // あまりにも数字が下がったら achive ラインを下げる
    if (notifySubsc > 0) {
      if (nowSubsc <= notifySubsc - 1000) {
        const over = nowSubsc % fund // 差分を取得
        const achiveSubsc = nowSubsc - over // 通知する登録者数
        channel.achivementSubscriber = achiveSubsc
        EventLog.warn(`> [${channel.channelId}] Achivement subscriber ${notifySubsc} => ${achiveSubsc} (fund: ${fund})`)
      }
    }
  }
}
