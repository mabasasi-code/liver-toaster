import { YoutubeAPI } from '../../../bootstrap'
import config from '../../../config/config'
import PushInterface from '../../../interface/pushbullet/PushInterface'
import { NotifyLog } from '../../../logger/Logger'
import UpdateVideoTask from '../../../task/UpdateVideoTask'
import BashYoutubeHandler from './BaseYoutubeHandler'

export default class LiveHandler extends BashYoutubeHandler {
  public readonly TITLE_PREFIX = '🔴 '
  public readonly TITLE_SCHEDULE_PREFIX = '🔴 30 分後に '

  protected updateVideoTask: UpdateVideoTask

  constructor () {
    super()
    this.updateVideoTask = new UpdateVideoTask(YoutubeAPI, NotifyLog)
  }

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
      NotifyLog.debug('> live schedule notify')
      await this.updateVideoTask.updateById(push.notification_tag)
    } else {
      NotifyLog.debug('> live start notify')
      await this.updateVideoTask.updateById(push.notification_tag)
    }
  }
}
