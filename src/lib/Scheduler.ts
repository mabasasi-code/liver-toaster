import dateformat from 'dateformat'
import schedule from 'node-schedule'
import { VideoStore } from '../bootstrap'
import { Log } from '../logger/Logger'
import VideoProcess from './process/VideoProcess'

export default class Scheduler {
  public async run(): Promise<void> {
    schedule.scheduleJob('*/10 * * * *', async (date: Date) => {
      try {
        // 5 分おきに処理をする
        Log.info('[schedule] ' + dateformat(date, 'yyyy-mm-dd HH:MM:ss'))
        await this.tenMinutes()
      } catch (err) {
        Log.error(err)
      }
    })
  }

  protected async tenMinutes() {
    // // db から処理対象っぽい動画を全部取り出す
    const videos = await VideoStore.find({ notifyEnd: false })
    if (videos.length > 0) {
      await VideoProcess.execByVideos(videos)
    }
  }
}
