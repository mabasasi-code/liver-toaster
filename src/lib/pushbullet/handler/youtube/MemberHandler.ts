import PushInterface from '../../../../interface/pushbullet/PushInterface'
import { YoutubeAPI } from '../../../../bootstrap'
import Channel from '../../../../model/Channel'
import CheckChannelCommunityTask from '../../../task/task/ScrapeChannelCommunityTask'
import { Logger } from 'log4js'
import UpdateVideoTask from '../../../task/task/UpdateVideoTask'
import BaseYoutubeHandler from './BaseYoutubeHandler'

export default class MemberHandler extends BaseYoutubeHandler {
  public readonly TITLE_SUFFIX = ' さんからのメンバー限定の投稿'

  protected checkChannelCommunityTask: CheckChannelCommunityTask

  constructor (logger: Logger) {
    super(logger)

    const uvTask = new UpdateVideoTask(logger, YoutubeAPI)
    this.checkChannelCommunityTask = new CheckChannelCommunityTask(logger, uvTask)
  }

  public async isValid(push: PushInterface, channel?: Channel): Promise<boolean> {
    const title = push.title || ''

    // チャンネルが DB にあるなら後方一致？
    if (channel && title.endsWith(channel.title + this.TITLE_SUFFIX)) {
      return true
    }

    return false
  }

  public async handle(push: PushInterface, channel?: Channel): Promise<void> {
    this.logger.debug('> member notify')

    // communiry を覗き見してくる
    await this.checkChannelCommunityTask.checkMatchText(push.body, channel, true)
  }
}
