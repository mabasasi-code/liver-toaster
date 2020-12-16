import PushInterface from '../../../interface/pushbullet/PushInterface'
import BaseHandler from './BaseHandler'
import LiveHandler from './youtube/LiveHandler'
import MemberHandler from './youtube/MemberHandler'
import { Logger } from 'log4js'
import { RecordLog } from '../../../logger/Logger'
import Channel from '../../../model/Channel'
import { IsNull } from 'typeorm'
import { find } from 'p-iteration'
import BaseYoutubeHandler from './youtube/BaseYoutubeHandler'

export default class YoutubeHandler extends BaseHandler {
  public readonly YOUTUBE_PACKAGE_NAME = 'com.google.android.youtube'

  private handlers: BaseYoutubeHandler[]

  constructor(logger: Logger) {
    super(logger)

    this.handlers = []
    this.handlers.push(new LiveHandler(logger))
    this.handlers.push(new MemberHandler(logger))
  }

  public async isValid(push: PushInterface): Promise<boolean> {
    if (push.package_name === this.YOUTUBE_PACKAGE_NAME) {
      return true
    }

    return false
  }

  public async handle(push: PushInterface): Promise<void> {
    // TODO: youtube は debug 用に dump しておく
    RecordLog.trace(JSON.stringify(push))

    // チャンネルの判定
    const channels = await Channel.find({ deletedAt: IsNull() })
    const channel = await find(channels, async (channel) => {
      return (push.title.includes(channel.title))
    })

    const chdump = channel ? `${channel.channelId}, "${channel.title}"` : 'unknown channel'
    this.logger.trace('> channel: ' + chdump)

    // 先頭からどれか一つ実行する (try-catch も上位に任せる)
    for (const handler of this.handlers) {
      const isValid = await handler.isValid(push, channel)
      if (isValid) {
        await handler.handle(push, channel)
        return
      }
    }

    this.logger.debug('> no handling')
  }
}
