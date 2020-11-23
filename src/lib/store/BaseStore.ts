import path from 'path'
import nedb from 'nedb-promises'
import VideoInterface from '../interface/database/VideoInterface'
import config from '../../config/Index'

export default class BaseStore<T> {
  private store: nedb

  constructor(filename: string) {
    const filePath = path.join(config.databasePath, filename)
    const store = nedb.create({
      filename: filePath,
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

  public async upsert(query: any, value: T): Promise<T | null> {
    const res: T | null = await this.store.update(
      query,
      { $set: value },
      { upsert: true, returnUpdatedDocs: true }
    )
    return res
  }
}
