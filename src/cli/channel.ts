import { CAC } from 'cac'
import { YoutubeAPI } from '../bootstrap'
import UpdateChannelTask from '../lib/task/task/UpdateChannelTask'
import { CliLog } from '../logger/Logger'
import Channel from '../model/Channel'

export default async function (cli: CAC) {
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
}
