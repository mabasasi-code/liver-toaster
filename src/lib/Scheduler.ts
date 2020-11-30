import dateformat from 'dateformat'
import schedule from 'node-schedule'
import { VideoStore } from '../bootstrap'
import { CronLog } from '../logger/Logger'
import FeedProcess from './process/FeedProcess'
import VideoProcess from './process/VideoProcess'
import config from '../config/config'
import { filterSeries } from 'p-iteration'

export default class Scheduler {
  protected videoProcess: VideoProcess
  protected feedProcess: FeedProcess

  protected jobs: schedule.Job[]

  constructor () {
    this.videoProcess = new VideoProcess(CronLog)
    this.feedProcess = new FeedProcess()

    this.jobs = []
  }

  public async run(): Promise<void> {
    const job = schedule.scheduleJob('*/10 * * * *', async (date: Date) => {
      try {
        // 5 分おきに処理をする
        CronLog.info('run: ' + dateformat(date, 'yyyy-mm-dd HH:MM:ss'))
        await this.checkVideos()

        // feed を拾ってくる
        await this.checkFeed()

      } catch (err) {
        CronLog.error(err)
      }
    })

    this.jobs.push(job)
  }

  public async stop() {
    for (const job of this.jobs) {
      job.cancel()
    }
    this.jobs = []
  }

  ///

  public async checkFeed() {
    try {
      // feed から id を抜き出す
      const channelId = config.youtube.channelId
      if (channelId) {
        const vids = await this.feedProcess.fetchVideoIds(channelId)

        // db に無いものだけを抽出する
        const nonExistIds = await filterSeries(vids, async (vid) => {
          const exist = await VideoStore.findOne({ videoId: vid })
          return exist === null
        })

        if (nonExistIds && nonExistIds.length > 0) {
          await this.videoProcess.updateByIds(nonExistIds)
        } else {
          CronLog.debug('> no new feed videos')
        }
      }
    } catch (err) {
      CronLog.error(err)
    }
  }

  public async checkVideos() {
    try {
      // db から処理対象っぽい動画を全部取り出す
      const videos = await VideoStore.findIncomplete()
      if (videos.length > 0) {
        await this.videoProcess.updateByVideos(videos)
      } else {
        CronLog.debug('> no to be updated videos')
      }
    } catch (err) {
      CronLog.error(err)
    }
  }
}
