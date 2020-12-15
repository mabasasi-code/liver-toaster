import dateformat from 'dateformat'
import schedule from 'node-schedule'
import diffDates from 'diff-dates'
import { CronLog } from '../../logger/Logger'
import TaskWrapper from './TaskWrapper'
import { YoutubeAPI } from '../../bootstrap'

export default class TaskScheduler {
  protected static CRON_JOB_NAME: string = 'cron'

  protected job: schedule.Job
  protected task: TaskWrapper

  constructor () {
    this.task = new TaskWrapper(CronLog, YoutubeAPI)
  }

  public async run(): Promise<void> {
    if (this.job) {
      throw new Error('Job is already running')
    }

    CronLog.info('Scheduler initialize')
    await this.task.checkAll(true)

    this.job = schedule.scheduleJob(
      TaskScheduler.CRON_JOB_NAME,
      '*/10 * * * *',
      async (date: Date) => { this.invoke(date) }
    )

    CronLog.info('Wait ...')
  }

  public async stop() {
    if (!this.job) {
      const res = schedule.cancelJob(TaskScheduler.CRON_JOB_NAME)
      if (!res) {
        throw new Error('Failed to stop job')
      }

      this.job = null
      return res
    }
    return false
  }

  ///

  public async invoke(date: Date) {
    try {
      const minute = date.getMinutes()

      // 10 分おきに処理をする
      CronLog.info('[run] start : ' + dateformat(date, 'yyyy-mm-dd HH:MM:ss'))

      // channek を更新する
      await this.task.checkChannel()

      // video を更新する
      await this.task.checkVideos()

      // community を漁ってくる (30 分おきにメンバーチェック)
      await this.task.checkCommunity(minute % 30 === 0)

      // 20 分おきに feed を拾ってくる
      if (minute % 20 === 0) {
        await this.task.checkFeed()
      }

      const msec = (diffDates(new Date(), date, 'milliseconds') / 1000).toFixed(2)
      CronLog.info('[run] finish: ' + dateformat(date, 'yyyy-mm-dd HH:MM:ss') + ` (${msec} sec)`)
    } catch (err) {
      CronLog.error(err)
    }
  }
}