import { Logger } from 'log4js'
import { mapSeries } from 'p-iteration'
import { IsNull } from 'typeorm'
import Youtube from '../lib/api/Youtube'
import ArrayToObject from '../lib/util/ArrayToObject'
import Channel from '../model/Channel'

export default class UpdateChannelTask {
  protected youtube: Youtube
  protected logger: Logger

  constructor (youtube: Youtube, logger: Logger) {
    this.youtube = youtube
    this.logger = logger
  }

  public async updateById(channelId: string) {
    return await this.updateByIds([channelId])
  }

  public async updateByIds(channelIds: string[]) {
    const dbChannels = await mapSeries(channelIds, async (id) => {
      const video = await Channel.findOne({ channelId: id })
      return video
    })
    await this.update(channelIds, dbChannels)
  }

  public async updateByChannels(channels: Channel[]) {
    const channelIds = channels.map(e => e.channelId)
    await this.update(channelIds, channels)
  }

  public async updateMonitoringChannels() {
    // db から処理対象っぽい動画を全部取り出す
    const dbVideos = await Channel.find({ deletedAt: IsNull() })
    await this.updateByChannels(dbVideos)
  }

  /// ////////////////////////////////////////////////////////////

  protected async update(channelIds: string[], channels?: Channel[]) {
    this.logger.debug(`Update channels: (${channelIds.length}) ` + JSON.stringify(channelIds))
    if (channelIds.length === 0) {
      this.logger.debug('> Skip')
      return false
    }

    // api を叩く (return { channelId: item | null })
    const apiChannels = await this.youtube.fetchChannelList(channelIds)
    if (!apiChannels) {
      throw new Error('Youtube API failure')
    }

    // dbChannel の map を生成する (return { channelId: item })
    const dbChannels = ArrayToObject<Channel>(channelIds, channels, (e) => e.channelId)

    // ID 基準で処理していく
    let idx = 1
    const length = channelIds.length
    for (const channelId of channelIds) {
      const db = dbChannels[channelId] || null // null なら db に存在しない新規チャンネル
      const api = apiChannels[channelId] || null // null なら 削除されたチャンネル
      this.logger.debug(`[${idx++}/${length}] cid: ${channelId} (db:${Boolean(db)}, api: ${Boolean(api)})`)

      if (api) {
        // API の値があるなら upsert (restore もする)
        const ch = db || new Channel()
        ch.assignAPI(api)
        ch.removeDeleteFlag()

        this.logger.trace(`> [${channelId}] upsert: ${ch.title}`)
        await ch.save()
      } else {
        // API の値が無くて, db があるなら削除処理
        if (db) {
          const ch = db
          ch.setDeleteFlag()

          this.logger.trace(`> [${channelId}] delete: ${ch.title}`)
          await ch.save()
        } else {
          // 実行されないはず
          this.logger.warn(`> skip: [${channelId}] => no data`)
        }
      }
    }

    return true
  }
}
