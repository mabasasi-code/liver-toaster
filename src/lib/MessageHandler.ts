import BasePushHandler from './handler/BasePushHandler'
import YoutubeHandler from './handler/YoutubeHandler'
import TestHandler from './handler/TestHandler'
import PushInterface from '../interface/pushbullet/PushInterface'
import { NotifyLog } from '../logger/Logger'

export default class MessageHandler {
  protected dumpAllNotify: boolean

  protected handlers: BasePushHandler[]

  constructor (dumpAllNotify: boolean = false) {
    this.dumpAllNotify = dumpAllNotify

    this.handlers = []
    this.handlers.push(new YoutubeHandler())
    this.handlers.push(new TestHandler())
  }

  public async invoke (push: PushInterface) {
    // 一つずつ全て実行する
    let hit = 0
    for (const handler of this.handlers) {
      try {
        // 処理対象かどうか判定
        const isValid = handler.isValid(push)
        if (isValid) {
          // 初ヒットなら dump
          if (hit === 0) NotifyLog.info(this.dumpString(push))
          hit ++

          // 処理実行
          await handler.handle(push)
        }
      } catch (err) {
        NotifyLog.error(err)
      }
    }

    // ノーヒットで config あったら通知
    if (hit === 0 && this.dumpAllNotify) {
      NotifyLog.info(this.dumpString(push))
    }
  }

  ///

  protected dumpString(push: PushInterface) {
    const device = push.source_device_iden || 'unknown device'
    const packageName = push.package_name || 'unknown package'
    const type = push.type || 'unknown'
    const title = push.title || 'unknown message'
    const text = push.body ? ': ' + this.simpleString(push.body, 80) : ''

    return `[${device}][${packageName}][${type}] ${title}${text}`
  }

  protected simpleString(value: any, limit: number = 200) {
    const text = (value || '').replace(/\r?\n/g, '\\n').substr(0, limit)
    return text
  }
}
