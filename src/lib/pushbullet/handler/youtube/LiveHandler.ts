import { Logger } from 'log4js'
import { YoutubeAPI } from '../../../../bootstrap'
import config from '../../../../config/config'
import PushInterface from '../../../../interface/pushbullet/PushInterface'
import UpdateVideoTask from '../../../task/task/UpdateVideoTask'
import BaseHandler from '../BaseHandler'

export default class LiveHandler extends BaseHandler {
  public readonly TITLE_PREFIX = '🔴 '
  public readonly TITLE_SCHEDULE_PREFIX = '🔴 30 分後に '

  protected updateVideoTask: UpdateVideoTask

  constructor (logger: Logger) {
    super(logger)

    this.updateVideoTask = new UpdateVideoTask(logger, YoutubeAPI)
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
      this.logger.debug('> live schedule notify')
      await this.updateVideoTask.updateById(push.notification_tag)
    } else {
      this.logger.debug('> live start notify')
      await this.updateVideoTask.updateById(push.notification_tag)
    }
  }
}
