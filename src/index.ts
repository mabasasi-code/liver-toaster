import { cac } from 'cac'
import { promises as fs } from 'fs'
import bootstrap, { PushbulletInstance, SchedulerInstance, YoutubeAPI } from './bootstrap'
import config from './config/config'
import PushHandler from './lib/pushbullet/PushHandler'
import { CliLog, Log } from './logger/Logger'
import Channel from './model/Channel'
import TaskWrapper from './lib/task/TaskWrapper'
import UpdateChannelTask from './lib/task/task/UpdateChannelTask'

const cli = cac()

/// ////////////////////////////////////////////////////////////
// channel command

cli
  .command('channel:add [...channelIds]', 'Add channel to monitor')
  .action(async (channelIds, options) => {
    CliLog.info('[Command] Add channel')

    const task = new UpdateChannelTask(CliLog, YoutubeAPI)
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

/// ////////////////////////////////////////////////////////////
// util command

cli
  .command('init', 'Initialize database')
  .action(async (options) => {
    const task = new TaskWrapper(CliLog, YoutubeAPI)
    await task.checkAll(true)
  })

cli
  .command('test:json <dir>', 'Test Notify from json file (pushbullet)')
  .action(async (dir, options) => {
    // テストなのでログは cli のみ
    // config を書き換える
    config.mode.disableTweet = true

    // ファイル読み込み
    Log.info(`Load: "${dir}"`)
    const json = await fs.readFile(dir, 'utf-8')
    const push = JSON.parse(json)

    // プッシュ処理
    const handler = new PushHandler(Log, true)
    await handler.invoke(push)
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
