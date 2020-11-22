import nedb from 'nedb-promises'
import VideoInterface from '../../interface/database/VideoInterface'

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

  public async find(videoId: string): Promise<T[] | null> {
    const videos: T[] | null = await this.store.find({ videoId: videoId })
    return videos
  }

  public async findOne(videoId: string): Promise<T | null> {
    const video: T | null = await this.store.findOne({ videoId: videoId })
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
