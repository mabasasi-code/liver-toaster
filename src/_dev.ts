import bootstrap, { PushbulletInstance, SchedulerInstance, TwitterAPI, YoutubeAPI } from './bootstrap'
import { promises as fs } from 'fs'
import Tweeter from './lib/util/Tweeter'
import config from './config/config'
import { Log } from './logger/Logger'
import Video from './model/Video'
import { createConnection } from 'typeorm'
import Youtube from './lib/api/Youtube'
import UpdateVideoTask from './task/UpdateVideoTask'
import UpdateChannelTask from './task/UpdateChannelTask'
import Channel from './model/Channel'
import ScrapeChannelCommunity from './task/ScrapeChannelCommunityTask'
import CheckChannelCommunityTask from './task/ScrapeChannelCommunityTask'

import { Cookie, CookieMap } from 'cookiefile'
import PushHandler from './lib/pushHandler/PushHandler'

const main = async () => {
  await bootstrap()

  // const channelId = 'UC1519-d1jzGiL1MPTxEdtSA'
  // const channel = await Channel.findOne({ channelId })

  // const scrape = new CheckChannelCommunityTask(YoutubeAPI, Log)
  // await scrape.checkFirst(channel, true)

  const json = await fs.readFile('./storage/records/json/mirrorMemberStream.json', 'utf-8')
  const push = JSON.parse(json)

  const handler = new PushHandler(Log, true)
  await handler.invoke(push)


  // const res = await YoutubeAPI.fetchVideo('jY26msbzvYI')
  // console.log(res)

  // const task = new UpdateVideoTask(YoutubeAPI, Log)
  // await task.updateById('jY26msbzvYI')

  // console.log(await Channel.find())


  // const videoId = 'sdMK9ACKI2I'

  // const task = new UpdateVideoTask(YoutubeAPI, Log)
  // await task.updateById('NQ8CWY99_pk')


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
