import dateformat from 'dateformat'
import schedule from 'node-schedule'
import { VideoStore } from '../bootstrap'
import { CronLog } from '../logger/Logger'
import VideoProcess from './process/VideoProcess'

export default class Scheduler {
  protected process: VideoProcess

  constructor () {
    this.process = new VideoProcess(CronLog)
  }

  public async run(): Promise<void> {
    schedule.scheduleJob('*/10 * * * *', async (date: Date) => {
      try {
        // 5 分おきに処理をする
        CronLog.info('run: ' + dateformat(date, 'yyyy-mm-dd HH:MM:ss'))
        await this.checkVideos()
      } catch (err) {
        CronLog.error(err)
      }
    })
  }

  public async checkVideos() {
    // // db から処理対象っぽい動画を全部取り出す
    const videos = await VideoStore.find({ notifyEnd: false })
    if (videos.length > 0) {
      await this.process.updateByVideos(videos)
    } else {
      CronLog.debug('> no videos')
    }
  }
}
