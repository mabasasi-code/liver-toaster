import config from '../../../../config/config'
import PushInterface from '../../../../interface/pushbullet/PushInterface'
import { YoutubeAPI } from '../../../../bootstrap'
import Channel from '../../../../model/Channel'
import CheckChannelCommunityTask from '../../../../task/ScrapeChannelCommunityTask'
import BaseHandler from '../BaseHandler'
import { Logger } from 'log4js'
import UpdateVideoTask from '../../../../task/UpdateVideoTask'

export default class MemberHandler extends BaseHandler {
  public readonly TITLE_SUFFIX = ' さんからのメンバー限定の投稿'

  protected checkChannelCommunityTask: CheckChannelCommunityTask

  constructor (logger: Logger) {
    super(logger)

    const uvTask = new UpdateVideoTask(YoutubeAPI, logger)
    this.checkChannelCommunityTask = new CheckChannelCommunityTask(uvTask, logger)
  }

  public isValid(push: PushInterface): boolean {
    const title = push.title || ''
    const channelName = config.youtube.channelName || ''

    // チャンネル名が指定されているなら完全一致、ないなら後方一致
    if (title.endsWith(channelName + this.TITLE_SUFFIX)) {
      return true
    }

    return false
  }

  public async handle(push: PushInterface): Promise<void> {
    this.logger.debug('> member notify')

    // channel の抽出
    const channelTitle = push.title.replace(this.TITLE_SUFFIX, '')
    const channel = await Channel.findOne({ title: channelTitle })
    if (!channel) {
      new Error(`Channel not found (title: ${channelTitle})`)
    }
    this.logger.trace(`> channel: ${channel.channelId}, ${channel.title}`)

    // communiry を覗き見してくる
    await this.checkChannelCommunityTask.checkMatchText(push.body, channel, true)
  }
}
