import { cac } from 'cac'
import bootstrap, { PushbulletInstance, YoutubeAPI } from './bootstrap'
import { CliLog } from './logger/Logger'
import Channel from './model/Channel'
import TaskWrapper from './task/TaskWrapper'
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
      const query = !isNaN(channelId)
        ? { id: channelId }
        : { channelId: channelId }
      const channel = await Channel.findOne(query)
      if (channel) {
        channel.setDeleteFlag()
        await channel.save()
        CliLog.debug(`> [${channelId}] remove ${channel.title}`)
      }
    }
  })

cli
.command('channel:list', 'Show list of channel')
.action(async (options) => {
  CliLog.info('[Command] Show list of channel')

  const channels = await Channel.find()
  channels.forEach((c) => {
    const del = Boolean(c.deletedAt) ? ' (deleted)' : ''
    const text = `[${c.id}] ${c.channelId} ${c.title}${del}`
    console.log(text)
  })
})

cli
  .command('init', 'Initialize database')
  .action(async (options) => {
    const task = new TaskWrapper(CliLog)
    await task.checkAll(true)
  })

cli
  .command('[no args]', 'Run')
  .action(async (options) => {
    if (cli.args.length > 0) {
      throw new Error('Command not found')
    }

    CliLog.info('[Command] Run')
    await PushbulletInstance.connect()
  })

/// ////////////////////////////////////////////////////////////

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
