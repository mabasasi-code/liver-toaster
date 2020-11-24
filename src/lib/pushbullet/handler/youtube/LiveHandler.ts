import config from '../../../../config'
import PushInterface from "../../../interface/pushbullet/PushInterface"
import { Log } from '../../../../logger/Logger'
import VideoProcess from '../../../process/VideoProcess'
import BashYoutubeHandler from "./BaseYoutubeHandler"

export default class LiveHandler extends BashYoutubeHandler {
  public readonly TITLE_PREFIX = '🔴 '
  public readonly TITLE_SCHEDULE_PREFIX = '🔴 30 分後に '

  public isValid(push: PushInterface): boolean {
    const title = push.title || ''
    const channelName = config.youtube.channelName || ''

    // チャンネル名が指定されているなら完全一致、ないなら先頭一致
    if (title.startsWith(this.TITLE_PREFIX + channelName)
    || title.startsWith(this.TITLE_SCHEDULE_PREFIX + channelName)) {
      return true
    }

    return false
  }

  public async handle(push: PushInterface): Promise<void> {
    if (push.title.startsWith(this.TITLE_SCHEDULE_PREFIX)) {
      Log.debug('> live schedule notify')
      await VideoProcess.processById(push.notification_tag)
    } else {
      Log.debug('> live start notify')
      await VideoProcess.processById(push.notification_tag)
    }
  }
}
