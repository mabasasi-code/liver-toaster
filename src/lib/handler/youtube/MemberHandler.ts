import config from '../../../config/config'
import { NotifyLog } from '../../../logger/Logger'
import PushInterface from '../../../interface/pushbullet/PushInterface'
import BashYoutubeHandler from './BaseYoutubeHandler'
import { YoutubeAPI } from '../../../bootstrap'
import Channel from '../../../model/Channel'
import CheckChannelCommunityTask from '../../../task/ScrapeChannelCommunityTask'

export default class MemberHandler extends BashYoutubeHandler {
  public readonly TITLE_SUFFIX = ' さんからのメンバー限定の投稿'

  protected checkChannelCommunityTask: CheckChannelCommunityTask

  constructor () {
    super()
    this.checkChannelCommunityTask = new CheckChannelCommunityTask(YoutubeAPI, NotifyLog)
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
    NotifyLog.debug('> member notify')

    // channel の抽出
    const channelTitle = push.title.replace(this.TITLE_SUFFIX, '')
    const channel = await Channel.findOne({ title: channelTitle })
    if (!channel) {
      new Error(`Channel not found (title: ${channelTitle})`)
    }
    NotifyLog.trace(`> channel: ${channel.channelId}, ${channel.title}`)

    // communiry を覗き見してくる
    await this.checkChannelCommunityTask.checkMatchText(push.body, channel, true)
  }
}
