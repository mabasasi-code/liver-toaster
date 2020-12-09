import { cac } from 'cac'
import bootstrap, { PushbulletInstance, YoutubeAPI } from './bootstrap'
import { CliLog } from './logger/Logger'
import Channel from './model/Channel'
import UpdateChannelTask from './task/UpdateChannelTask'

const cli = cac()

cli
  .command('channel:add [...channelIds]', 'Add channel to monitor')
  .action(async (channelIds, options) => {
    CliLog.info('[Command] Add channel')

    const task = new UpdateChannelTask(YoutubeAPI, CliLog)
    await task.updateByIds(channelIds)
  })

cli
  .command('channel:remove [...channelIds]', 'Remove channel to monitor')
  .action(async (channelIds, options) => {
    CliLog.info('[Command] Remove channel')

    for (const channelId of channelIds) {
      const channel = await Channel.findOne({ channelId: channelId })
      if (channel) {
        channel.setDeleteFlag()
        await channel.save()
        CliLog.debug(`> [${channelId}] remove`)
      }
    }
  })

cli
  .command('', 'Run')
  .action(async () => {
    CliLog.info('[Command] Run')

    await PushbulletInstance.connect()
  })

/// ////////////////////////////////////////////////////////////

cli.help()
cli.parse(process.argv, { run: false })

const main = async () => {
  await bootstrap()
  await cli.runMatchedCommand()
  CliLog.info('> Success')
}

main()
  .catch(err => {
    CliLog.error(err)
    process.exit(1)
  })
