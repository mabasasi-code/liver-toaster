import { get } from 'dot-prop'
import { filterSeries } from 'p-iteration'
import Parser from 'rss-parser'
import Video from '../model/Video'

export default class FetchFeedTask {
  protected parser: Parser

  constructor () {
    this.parser = new Parser()
  }

  public async get(channelId: string) {
    if (!channelId) throw new ReferenceError('No channel ID')

    const url = 'https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId
    const feed = await this.parser.parseURL(url)

    const items = get(feed, 'items', [])
    const videoIds = items.map(item => {
      const vid = get(item, 'id', '')
        .replace('yt:video:', '')
      return vid
    })
    return videoIds
  }

  public async getNotInDB(channelId: string) {
    const vids = await this.get(channelId)

    // db に無いものだけを抽出する
    const notInIds = await filterSeries(vids, async (vid) => {
      const count = await Video.count({ videoId: vid })
      return count === 0
    })

    return notInIds
  }
}
