import bootstrap, { PushbulletInstance, TwitterAPI } from './bootstrap'
import { promises as fs } from 'fs'

const main = async () => {
  await bootstrap()

  const json = await fs.readFile('./storage/records/json/mirrorStartLiveStreaming.json', 'utf-8')
  const push = JSON.parse(json)

  await PushbulletInstance.pushHandle(push)
}

main()
