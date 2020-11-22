import { promises as fs } from 'fs'
import bootstrap, { PushbulletInstance, TwitterAPI } from './bootstrap'
import config from './config/Index'
import { Log } from './logger/Logger'

const main = async () => {
  await bootstrap()

  const pushUser = await PushbulletInstance.connect()
  const clientUser = await TwitterAPI.getClientUser()

  const device = (pushUser.name || '--') + ' (' + pushUser.iden + ')'
  const client = (clientUser.name || '--') + ' (@' + (clientUser.screen_name || '--') + ')'
  const target = config.youtube.channelName || 'all'

  Log.info('listen ...')
  Log.info('> device: ' + device)
  Log.info('> client: ' + client)
  Log.info('> setup: ' + JSON.stringify(config.mode))
  Log.info('> target: ' + target + '\n')

  const json = await fs.readFile('./storage/records/json/mirrorStartLiveStreaming.json', 'utf-8')
  const push = JSON.parse(json)

  await PushbulletInstance.pushHandle(push)
}

main()
