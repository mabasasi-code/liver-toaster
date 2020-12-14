import BaseHandler from './handler/BaseHandler'
import YoutubeHandler from './handler/YoutubeHandler'
import TestHandler from './handler/TestHandler'
import PushInterface from '../../interface/pushbullet/PushInterface'
import { Logger } from 'log4js'
import Loggable from '../util/Loggable'

export default class PushHandler extends Loggable {
  protected dumpAllNotify: boolean
  protected handlers: BaseHandler[]

  constructor (logger: Logger, dumpAllNotify: boolean = false) {
    super(logger)

    this.dumpAllNotify = dumpAllNotify

    this.handlers = []
    this.handlers.push(new YoutubeHandler(logger))
    this.handlers.push(new TestHandler(logger))
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
          if (hit === 0) this.logger.info(this.dumpString(push))
          hit ++

          // 処理実行
          await handler.handle(push)
        }
      } catch (err) {
        this.logger.error(err)
      }
    }

    // ノーヒットで config あったら通知
    if (hit === 0 && this.dumpAllNotify) {
      this.logger.info(this.dumpString(push))
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
