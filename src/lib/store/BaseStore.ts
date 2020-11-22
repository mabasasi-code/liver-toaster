import nedb from 'nedb-promises'
import VideoInterface from '../interface/database/VideoInterface'

export default class BaseStore<T> {
  private store: nedb

  constructor(filename: string) {
    const store = nedb.create({
      filename: filename,
      timestampData: true,
      autoload: true,
    })
    this.store = store
  }

  public async find(query: any): Promise<T[] | null> {
    const videos: T[] | null = await this.store.find(query)
    return videos
  }

  public async findOne(query: any): Promise<T | null> {
    const video: T | null = await this.store.findOne(query)
    return video
  }

  public async upsert(video: VideoInterface): Promise<T | null> {
    const res: T | null = await this.store.update(
      { videoId: video.videoId },
      { $set: video },
      { upsert: true, returnUpdatedDocs: true }
    )
    return res
  }
}