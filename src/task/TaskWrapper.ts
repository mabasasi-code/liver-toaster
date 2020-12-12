import { Logger } from "log4js";
import { YoutubeAPI } from "../Bootstrap";
import config from "../config/config";
import FetchFeedTask from "./FetchFeedTask";
import CheckChannelCommunityTask from "./ScrapeChannelCommunityTask";
import UpdateChannelTask from "./UpdateChannelTask";
import UpdateVideoTask from "./UpdateVideoTask";

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
    this.fetchFeedTask = new FetchFeedTask()
  }

  public async checkAll(isMember: boolean = false) {
    await this.checkChannel()
    await this.checkVideos()

    await this.checkFeed()
    await this.checkCommunity(isMember)
  }

  ///

  public async checkChannel() {
    this.logger.debug('<Task to check channels>')

    try {
      await this.updateChannelTask.updateMonitoringChannels()
    } catch (err) {
      this.logger.error(err)
    }
  }

  public async checkVideos() {
    this.logger.debug('<Task to check videos>')

    try {
      await this.updateVideoTask.updateMonitoringVideos()
    } catch (err) {
      this.logger.error(err)
    }
  }

  public async checkFeed() {
    // TODO: 未完成
    this.logger.debug('<Task to check feed>')

    try {
      const channelId = config.youtube.channelId
      if (channelId) {
        const notIns = await this.fetchFeedTask.getNotInDB(channelId)
        await this.updateVideoTask.updateByIds(notIns)
      }
    } catch (err) {
      this.logger.error(err)
    }
  }

  public async checkCommunity(isMember: boolean) {
    this.logger.debug('<Task to check community>' + ` (isMember: ${isMember})`)

    try {
      await this.checkChannelCommunityTask.checkMonitoringChannel(isMember)
    } catch (err) {
      this.logger.error(err)
    }
  }
}
