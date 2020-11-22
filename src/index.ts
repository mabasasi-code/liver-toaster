import { promises as fs } from 'fs'
import config from './config/Index'
import Twitter from './lib/api/Twitter'
import Pushbullet from './lib/pushbullet/Pushbullet'
import Tweeter from './lib/util/Tweeter'
import { Log } from './logger/Logger'

const boot = async () => {
  const pushbullet = new Pushbullet(
    config.pushbullet.accessToken,
    config.pushbullet.encryptionKey
  )

  const twitter = new Twitter(
    config.twitter.consumerKey,
    config.twitter.consumerSecret,
    config.twitter.accessToken,
    config.twitter.accessTokenSecret,
    config.mode.ignoreTweet,
  )
  Tweeter.client = twitter // global にセット

  const pushUser = await pushbullet.connect()
  const clientUser = await twitter.getClientUser()

  const device = (pushUser.name || '--') + ' (' + pushUser.iden + ')'
  const client = (clientUser.name || '--') + ' (@' + (clientUser.screen_name || '--') + ')'
  const target = config.youtube.channelName || 'all'

  Log.info('listen ...')
  Log.info('> device: ' + device)
  Log.info('> client: ' + client)
  Log.info('> setup: ' + JSON.stringify(config.mode))
  Log.info('> target: ' + target)

  // const tweet = await twitter.postTweet(new Date().toLocaleString())
  // console.log(tweet)

  // const json = await fs.readFile('./storage/records/json/mirrorTest.json', 'utf-8')
  // const push = JSON.parse(json)

  // await pushbullet.pushHandle(push)
}

boot()
