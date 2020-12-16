
import { createConnection } from 'typeorm'
import config from './config/config'
import Twitter from './lib/api/Twitter'
import Youtube from './lib/api/Youtube'
import Pushbullet from './lib/pushbullet/Pushbullet'
import TaskScheduler from './lib/task/TaskScheduler'
import { CronLog, NotifyLog } from './logger/Logger'

// TODO: 仮実装

export let YoutubeAPI: Youtube
export let TwitterAPI: Twitter

export let PushbulletInstance: Pushbullet
export let SchedulerInstance: TaskScheduler

export default async () => {
  await createConnection()

  YoutubeAPI = new Youtube(config.youtube.apiKey)

  TwitterAPI = new Twitter(
    config.twitter.consumerKey,
    config.twitter.consumerSecret,
    config.twitter.accessToken,
    config.twitter.accessTokenSecret,
  )

  PushbulletInstance = new Pushbullet(
    NotifyLog,
    config.pushbullet.accessToken,
    config.pushbullet.encryptionKey
  )

  SchedulerInstance = new TaskScheduler(
    CronLog,
    YoutubeAPI,
  )
}
