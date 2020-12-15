import { Logger } from 'log4js'
import { IsNull } from 'typeorm'
import Youtube from '../api/Youtube'
import Loggable from '../util/Loggable'
import Channel from '../../model/Channel'
import FetchFeedTask from './task/FetchFeedTask'
import CheckChannelCommunityTask from './task/ScrapeChannelCommunityTask'
import UpdateChannelTask from './task/UpdateChannelTask'
import UpdateVideoTask from './task/UpdateVideoTask'

export default class TaskWrapper extends Loggable {
  protected updateChannelTask: UpdateChannelTask
  protected updateVideoTask: UpdateVideoTask

  protected checkChannelCommunityTask: CheckChannelCommunityTask
  protected fetchFeedTask: FetchFeedTask

  constructor(logger: Logger, youtube: Youtube) {
    super(logger)

    this.updateChannelTask = new UpdateChannelTask(logger, youtube)
    this.updateVideoTask = new UpdateVideoTask(logger, youtube)
    this.checkChannelCommunityTask = new CheckChannelCommunityTask(logger, this.updateVideoTask)
    this.fetchFeedTask = new FetchFeedTask(logger)
  }

  public async checkAll(isMember: boolean = false) {
    await this.checkChannel()
    await this.checkVideos()

    await this.checkFeed()
    await this.checkCommunity(isMember)
  }

  ///

  public async checkChannel() {
    this.logger.info('<Task to check channels>')

    try {
      await this.updateChannelTask.updateMonitoringChannels()
      this.logger.debug('<Success>')
    } catch (err) {
      this.logger.error(err)
    }
  }

  public async checkVideos() {
    this.logger.info('<Task to check videos>')

    try {
      await this.updateVideoTask.updateMonitoringVideos()
      this.logger.debug('<Success>')
    } catch (err) {
      this.logger.error(err)
    }
  }

  public async checkFeed() {
    this.logger.info('<Task to check feed>')

    try {
      // 対象っぽいやつ
      const channels = await Channel.find({ deletedAt: IsNull() })
      const ids = []

      // 動画IDを抽出する
      for (const channel of channels) {
        const channelId = channel.channelId
        const notIns = await this.fetchFeedTask.getVideoIdsNotInDB(channelId)
        ids.push(...notIns)
      }

      // 動画 update
      await this.updateVideoTask.updateByIds(ids)
      this.logger.debug('<Success>')
    } catch (err) {
      this.logger.error(err)
    }
  }

  public async checkCommunity(isMember: boolean) {
    this.logger.info('<Task to check community>' + ` (isMember: ${isMember})`)

    try {
      // 対象っぽいやつ
      const channels = await Channel.find({ deletedAt: IsNull() })

      for (const channel of channels) {
        // TODO: 動画を単体取得してるのが勿体ないかも
        await this.checkChannelCommunityTask.checkFirst(channel, isMember)
      }

      this.logger.debug('<Success>')
    } catch (err) {
      this.logger.error(err)
    }
  }
}
