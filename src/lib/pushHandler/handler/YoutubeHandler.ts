import PushInterface from '../../../interface/pushbullet/PushInterface';
import BaseHandler from './BaseHandler';
import LiveHandler from './youtube/LiveHandler';
import MemberHandler from './youtube/MemberHandler';
import { Logger } from 'log4js';
import { RecordLog } from '../../../logger/Logger';

export default class YoutubeHandler extends BaseHandler {
  public readonly YOUTUBE_PACKAGE_NAME = 'com.google.android.youtube'

  private handlers: BaseHandler[]

  constructor(logger: Logger) {
    super(logger)

    this.handlers = []
    this.handlers.push(new LiveHandler(logger))
    this.handlers.push(new MemberHandler(logger))
  }

  public isValid(push: PushInterface): boolean {
    if (push.package_name === this.YOUTUBE_PACKAGE_NAME) {
      return true
    }

    return false
  }

  public async handle(push: PushInterface): Promise<void> {
    // TODO: youtube は debug 用に dump しておく
    RecordLog.trace(JSON.stringify(push))

    // 先頭からどれか一つ実行する (try-catch も上位に任せる)
    for (const handler of this.handlers) {
      const isValid = handler.isValid(push)
      if (isValid) {
        await handler.handle(push)
        return
      }
    }

    this.logger.debug('> no handling')
  }
}
