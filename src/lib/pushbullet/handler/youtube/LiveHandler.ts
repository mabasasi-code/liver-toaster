import { Logger } from 'log4js'
import { YoutubeAPI } from '../../../../bootstrap'
import config from '../../../../config/config'
import PushInterface from '../../../../interface/pushbullet/PushInterface'
import Channel from '../../../../model/Channel'
import UpdateVideoTask from '../../../task/task/UpdateVideoTask'
import BaseYoutubeHandler from './BaseYoutubeHandler'

export default class LiveHandler extends BaseYoutubeHandler {
  public readonly TITLE_PREFIX = '🔴 '
  public readonly TITLE_SCHEDULE_PREFIX = '🔴 30 分後に '
  // public readonly TITLE_SCHEDULE_SUFFIX = ' のライブ配信が始まります。'

  protected updateVideoTask: UpdateVideoTask

  constructor (logger: Logger) {
    super(logger)

    this.updateVideoTask = new UpdateVideoTask(logger, YoutubeAPI)
  }

  public async isValid(push: PushInterface, channel?: Channel): Promise<boolean> {
    const title = push.title || ''

    // チャンネルが DB にあるなら完全一致
    if (channel) {
      if (title.startsWith(this.TITLE_PREFIX + channel.title)
        || title.startsWith(this.TITLE_SCHEDULE_PREFIX + channel.title)) {
        console.log(this.TITLE_SCHEDULE_PREFIX)
        return true
      }
    }

    // 無い場合、全動画を処理する設定なら先頭一致
    if (config.mode.handleAllVideo && title.startsWith(this.TITLE_PREFIX)) {
      console.log(this.TITLE_PREFIX)
      return true
    }

    return false
  }

  public async handle(push: PushInterface, channel?: Channel): Promise<void> {
    if (push.title.startsWith(this.TITLE_SCHEDULE_PREFIX)) {
      this.logger.debug('> live schedule notify')
      await this.updateVideoTask.updateById(push.notification_tag)
    } else {
      this.logger.debug('> live start notify')
      await this.updateVideoTask.updateById(push.notification_tag)
    }
  }
}
