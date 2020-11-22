import { get } from 'dot-prop'
import { google, youtube_v3 } from 'googleapis'
import VideoInterface from '../../interface/youtube/VideoInterface'

export default class Youtube {
  private client: youtube_v3.Youtube

  constructor (apiKey: string) {
    const client = google.youtube({
      version: 'v3',
      auth: apiKey,
    })
    this.client = client
  }

  public async fetchVideo(videoId: string): Promise<VideoInterface | null> {
    const map = await this.fetchVideoList([videoId])
    return get(map, videoId)
  }

  public async fetchVideoList(videoIds: string[]): Promise<{ [key:string]: VideoInterface | null }> {
    const res = await this.client.videos.list({
      part: ['id', 'snippet', 'contentDetails', 'statistics', 'status', 'liveStreamingDetails'],
      id: videoIds,
      maxResults: 50
    })
    const items = get(res, 'data.items', [])

    // key に対して mapping する (null なら削除データ)
    const map = Object.fromEntries(videoIds.map(id => [id, null]))
    for (const item of items) {
      const key: string = get(item, 'id')
      if (key) {
        map[key] = item
      }
    }
    return map
  }
}
