import bootstrap, { PushbulletInstance, SchedulerInstance, TwitterAPI, VideoStore } from './bootstrap'
import { promises as fs } from 'fs'
import Tweeter from './lib/util/Tweeter'
import Video from './lib/store/Video'
import VideoProcess from './lib/process/VideoProcess'
import FeedProcess from './lib/process/FeedProcess'
import config from './config/config'
import { Log } from './logger/Logger'

const main = async () => {
  await bootstrap()

  const scueduler = SchedulerInstance
  await scueduler.run()

  // await VideoStore.reload()


  // await VideoProcess.execById('Vhg8j76q3sI')

  // const json = await fs.readFile('./storage/records/json/mirrorSchedule.json', 'utf-8')
  // const push = JSON.parse(json)

  // await PushbulletInstance.pushHandle(push)

  // await ScheduleProcess.exec()
  // const video = await VideoStore.findOne({ videoId: 'mXZ4mBCUGPk' })
  // await Tweeter.endLiveStreaming(video)

  // const fp = new FeedProcess()
  // const ids = await fp.fetchVideoIds(config.youtube.channelId)
  // console.log(ids)

  // const vp = new VideoProcess(Log)
  // await vp.updateById('KwGKOBSZf7ss')
}

main()
