import { get } from 'dot-prop'
import Parser from 'rss-parser'

export default class FeedProcess {
  protected parser: Parser

  constructor () {
    this.parser = new Parser()
  }

  public async fetchVideoIds(channelId: string) {
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
}
