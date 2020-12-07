import dateformat from 'dateformat'
import schedule from 'node-schedule'
import { YoutubeAPI } from '../bootstrap'
import { CronLog } from '../logger/Logger'
import config from '../config/config'
import UpdateVideoTask from '../task/UpdateVideoTask'
import FetchFeedTask from '../task/FetchFeedTask'

export default class Scheduler {
  protected updateVideoTask: UpdateVideoTask
  protected fetchFeedTask: FetchFeedTask

  protected jobs: schedule.Job[]

  constructor () {
    this.updateVideoTask = new UpdateVideoTask(YoutubeAPI, CronLog)
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

    const job = schedule.scheduleJob('*/10 * * * *', async (date: Date) => {
      try {
        // 10 分おきに処理をする
        CronLog.info('[run] start : ' + dateformat(date, 'yyyy-mm-dd HH:MM:ss'))
        await this.checkVideos()

        // feed を拾ってくる
        await this.checkFeed()

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

  ///

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

  public async checkVideos() {
    CronLog.debug('Check videos in DB')

    try {
      await this.updateVideoTask.updateMonitoringVideos()
    } catch (err) {
      CronLog.error(err)
    }
  }
}
