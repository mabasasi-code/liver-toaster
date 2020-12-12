import dateformat from 'dateformat'
import schedule from 'node-schedule'
import { YoutubeAPI } from '../bootstrap'
import { CronLog } from '../logger/Logger'
import config from '../config/config'
import UpdateVideoTask from '../task/UpdateVideoTask'
import FetchFeedTask from '../task/FetchFeedTask'
import UpdateChannelTask from '../task/UpdateChannelTask'
import CheckChannelCommunityTask from '../task/ScrapeChannelCommunityTask'

export default class Scheduler {
  protected updateChannelTask: UpdateChannelTask
  protected updateVideoTask: UpdateVideoTask

  protected checkChannelCommunityTask: CheckChannelCommunityTask
  protected fetchFeedTask: FetchFeedTask

  protected jobs: schedule.Job[]

  constructor () {
    this.updateChannelTask = new UpdateChannelTask(YoutubeAPI, CronLog)
    this.updateVideoTask = new UpdateVideoTask(YoutubeAPI, CronLog)
    this.checkChannelCommunityTask = new CheckChannelCommunityTask(this.updateVideoTask, CronLog)
    this.fetchFeedTask = new FetchFeedTask()

    this.jobs = []
  }

  public async run(): Promise<void> {
    if (this.jobs.length > 0) {
      throw new Error('Job is already running')
    }

    CronLog.info('Scheduler initialize')
    await this.checkVideos()
    await this.checkFeed()
    await this.checkCommunity(true)
    await this.checkFeed()

    const job = schedule.scheduleJob('*/10 * * * *', async (date: Date) => {
      try {
        const minute = date.getMinutes()

        // 10 分おきに処理をする
        CronLog.info('[run] start : ' + dateformat(date, 'yyyy-mm-dd HH:MM:ss'))

        // channek を更新する
        await this.checkChannel()

        // video を更新する
        await this.checkVideos()

        // community を漁ってくる (30 分おきにメンバーチェック)
        await this.checkCommunity(minute % 30 === 0)

        // 20 分おきに feed を拾ってくる
        if (minute % 20 === 0) {
          await this.checkFeed()
        }

        CronLog.info('[run] finish: ' + dateformat(date, 'yyyy-mm-dd HH:MM:ss'))
      } catch (err) {
        CronLog.error(err)
      }
    })

    this.jobs.push(job)
    CronLog.info('Scheduled job has started')
  }

  public async stop() {
    for (const job of this.jobs) {
      job.cancel()
    }
    this.jobs = []
  }

  /// ////////////////////////////////////////////////////////////

  public async checkChannel() {
    CronLog.debug('Check channel in DB')

    try {
      await this.updateChannelTask.updateMonitoringChannels()
    } catch (err) {
      CronLog.error(err)
    }
  }

  public async checkVideos() {
    CronLog.debug('Check videos in DB')

    try {
      await this.updateVideoTask.updateMonitoringVideos()
    } catch (err) {
      CronLog.error(err)
    }
  }

  public async checkCommunity(isMember: boolean) {
    CronLog.debug(`Check youtube community (isMember: ${isMember})`)

    try {
      await this.checkChannelCommunityTask.checkMonitoringChannel(isMember)
    } catch (err) {
      CronLog.error(err)
    }
  }

  public async checkFeed() {
    CronLog.debug('Check feed by registered channel')

    try {
      const channelId = config.youtube.channelId
      if (channelId) {
        const notIns = await this.fetchFeedTask.getNotInDB(channelId)
        await this.updateVideoTask.updateByIds(notIns)
      }
    } catch (err) {
      CronLog.error(err)
    }
  }
}
