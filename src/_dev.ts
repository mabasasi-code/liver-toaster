import bootstrap, { PushbulletInstance, SchedulerInstance, TwitterAPI, VideoStore, YoutubeAPI } from './bootstrap'
import { promises as fs } from 'fs'
import Tweeter from './lib/util/Tweeter'
import VideoProcess from './lib/process/VideoProcess'
import FeedProcess from './lib/process/FeedProcess'
import config from './config/config'
import { Log } from './logger/Logger'
import Video from './model/Video'
import { createConnection } from 'typeorm'
import Youtube from './lib/api/Youtube'
import UpdateVideoTask from './task/UpdateVideoTask'

const main = async () => {
  await bootstrap()
  await createConnection()

  const videoId = 'sdMK9ACKI2I'

  const task = new UpdateVideoTask(YoutubeAPI, Log)
  await task.updateById(videoId)


  // await Video.delete({})


  // const YoutubeAPI = new Youtube(config.youtube.apiKey)
  // const task = new UpdateVideoTask(YoutubeAPI, Log)

  // await task.updateById(videoId)
  ///

  // const api = await YoutubeAPI.fetchVideo(videoId)
  // // console.log(api)

  // const video = await Video.findOne({ videoId: videoId }) || new Video()
  // video.assignAPI(api)
  // console.log(video)

  // // video.actualStartTime = null
  // // video.actualEndTime = null
  // video.endTweetId = null

  // await video.save()
  // console.log(video)




  // await bootstrap()

  // const scueduler = SchedulerInstance
  // await scueduler.run()

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
