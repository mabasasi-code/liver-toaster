import twitter from './lib/twitters/twitter'
import dateformat from 'dateformat'
import { promises as fs } from 'fs'
import wrap from './lib/tweeter'
import pushHandle from './lib/pushHandle'

import config from './config/index'

// process.env.DUMP_MODE = true
const func = async function () {
  console.log(config)

  const user = await twitter.getClientUser()
  console.log(user.screen_name)

  const json = await fs.readFile('./records/json/mirrorStartLiveStreaming.json', 'utf-8')
  // // const json = await fs.readFile('./records/json/mirrorTest.json', 'utf-8')
  const post = JSON.parse(json)

  await pushHandle(post)
}

func()
  .catch(err => console.log(err))
  .finally(() => process.exit(0))

