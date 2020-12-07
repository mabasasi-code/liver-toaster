import config from '../../../config/config'
import { Log } from '../../../logger/Logger'
import PushInterface from '../../../interface/pushbullet/PushInterface'
import Tweeter from '../../util/Tweeter'
import BashYoutubeHandler from './BaseYoutubeHandler'

export default class MemberHandler extends BashYoutubeHandler {
  public readonly TITLE_SUFFIX = ' さんからのメンバー限定の投稿'

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
    Log.debug('> member notify')
    await Tweeter.builder().postMemberCommunity(config.youtube.channelId)
  }
}