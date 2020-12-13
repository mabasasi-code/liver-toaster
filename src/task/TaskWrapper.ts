import { Logger } from 'log4js'
import { IsNull } from 'typeorm'
import { YoutubeAPI } from '../bootstrap'
import Channel from '../model/Channel'
import FetchFeedTask from './FetchFeedTask'
import CheckChannelCommunityTask from './ScrapeChannelCommunityTask'
import UpdateChannelTask from './UpdateChannelTask'
import UpdateVideoTask from './UpdateVideoTask'

export default class TaskWrapper {
  protected logger: Logger

  protected updateChannelTask: UpdateChannelTask
  protected updateVideoTask: UpdateVideoTask

  protected checkChannelCommunityTask: CheckChannelCommunityTask
  protected fetchFeedTask: FetchFeedTask

  constructor(logger: Logger) {
    this.logger = logger

    this.updateChannelTask = new UpdateChannelTask(YoutubeAPI, logger)
    this.updateVideoTask = new UpdateVideoTask(YoutubeAPI, logger)
    this.checkChannelCommunityTask = new CheckChannelCommunityTask(this.updateVideoTask, logger)
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
