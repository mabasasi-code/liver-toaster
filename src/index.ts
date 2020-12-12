import bootstrap, { PushbulletInstance } from './bootstrap'
import { Log } from './logger/Logger'

const main = async () => {
  await bootstrap()
  await PushbulletInstance.connect()
}

main()
  .catch(err => {
    Log.error(err)
    process.exit(1)
  })
