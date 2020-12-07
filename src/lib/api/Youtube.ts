import { get } from 'dot-prop'
import { google, youtube_v3 } from 'googleapis'
import YoutubeVideoInterface from '../interface/youtube/YoutubeVideoInterface'
import ArrayToObject from '../util/ArrayToObject'

export default class Youtube {
  private client: youtube_v3.Youtube

  constructor (apiKey: string) {
    const client = google.youtube({
      version: 'v3',
      auth: apiKey,
    })
    this.client = client
  }

  public async fetchVideo(videoId: string): Promise<YoutubeVideoInterface | null> {
    const map = await this.fetchVideoList([videoId])
    return get(map, videoId)
  }

  public async fetchVideoList(videoIds: string[]): Promise<{ [key:string]: YoutubeVideoInterface | null }> {
    const res = await this.client.videos.list({
      part: ['id', 'snippet', 'contentDetails', 'statistics', 'status', 'liveStreamingDetails'],
      id: videoIds,
      maxResults: 50
    })
    const items = get(res, 'data.items', [])

    // mapping する
    const map = ArrayToObject<YoutubeVideoInterface>(videoIds, items, (e) => get(e, 'id'))
    return map
  }
}
