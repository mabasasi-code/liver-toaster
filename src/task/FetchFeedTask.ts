import { get } from 'dot-prop'
import { Logger } from 'log4js'
import { filterSeries } from 'p-iteration'
import Parser from 'rss-parser'
import Video from '../model/Video'

export default class FetchFeedTask {
  protected logger: Logger
  protected parser: Parser

  constructor (logger: Logger) {
    this.logger = logger
    this.parser = new Parser()
  }

  public async getVideoIds(channelId: string) {
    this.logger.debug(`Check feed: ${channelId}`)

    if (!channelId) throw new ReferenceError('No channel ID')

    const url = 'https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId
    this.logger.debug('> call: ' + url)

    const feed = await this.parser.parseURL(url)

    // パース
    const items = get(feed, 'items', [])
    const videoIds = items.map(item => {
      const vid = get(item, 'id', '')
        .replace('yt:video:', '')
      return vid
    })
    return videoIds
  }

  public async getVideoIdsNotInDB(channelId: string) {
    const vids = await this.getVideoIds(channelId)

    // db に無いものだけを抽出する
    const notInIds = await filterSeries(vids, async (vid) => {
      const count = await Video.count({ videoId: vid })
      return count === 0
    })
    this.logger.debug('> filter: ' + vids.length + ' => ' + notInIds.length)

    return notInIds
  }
}
