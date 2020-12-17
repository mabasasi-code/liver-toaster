import { cac } from 'cac'
import bootstrap, { PushbulletInstance, SchedulerInstance, YoutubeAPI } from './bootstrap'
import { CliLog } from './logger/Logger'
import TaskWrapper from './lib/task/TaskWrapper'
import Tweeter from './lib/util/Tweeter'
import test from './cli/test'
import channel from './cli/channel'

const cli = cac()

cli
  .command('init', 'Initialize database')
  .action(async (options) => {
    CliLog.info('[Command] Database initialize')

    const task = new TaskWrapper(CliLog, YoutubeAPI)
    await task.checkAll(true)
  })

cli
.command('tweet <message>', 'Test Notify from json file (pushbullet)')
.action(async (message, options) => {
  CliLog.info('[Command] Tweet')

  if (message) {
    await Tweeter.builder().simpleTweet(message)
  }
})

/// ////////////////////////////////////////////////////////////
// main command

cli
  .command('[no args]', 'Run')
  .action(async (options) => {
    if (cli.args.length > 0) {
      throw new Error('Command not found')
    }

    CliLog.info('[Command] Run')
    await SchedulerInstance.run()
    await PushbulletInstance.run()
  })

/// ////////////////////////////////////////////////////////////

channel(cli)
test(cli)

cli.help()
cli.parse(process.argv, { run: false })

const main = async () => {
  await bootstrap()
  await cli.runMatchedCommand()
}

main()
  .catch(err => {
    CliLog.error(err)
    process.exit(1)
  })
