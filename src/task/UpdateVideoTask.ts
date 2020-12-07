import { Logger } from 'log4js'
import { mapSeries } from 'p-iteration'
import { IsNull } from 'typeorm'
import Youtube from '../lib/api/Youtube'
import ArrayToObject from '../lib/util/ArrayToObject'
import Video from '../model/Video'

export default class UpdateVideoTask {
  protected youtube: Youtube
  protected logger: Logger

  constructor (youtube: Youtube, logger: Logger) {
    this.youtube = youtube
    this.logger = logger
  }

  // 通知からメイン
  public async updateById(videoId: string) {
    return await this.updateByIds([videoId])
  }

  // feedからメイン
  public async updateByIds(videoIds: string[]) {
    const dbVideos = await mapSeries(videoIds, async (id) => {
      const video = await Video.findOne({ videoId: id })
      return video
    })
    await this.update(videoIds, dbVideos)
  }

  // スケジューラーからメイン
  public async updateMonitoringVideos() {
    // db から処理対象っぽい動画を全部取り出す
    const dbVideos = await Video.find({ endTweetId: IsNull(), deletedAt: IsNull() })
    await this.updateByVideos(dbVideos)
  }

  /// ////////////////////////////////////////////////////////////

  public async updateByVideos(videos: Video[]) {
    const videoIds = videos.map(e => e.videoId)
    await this.update(videoIds, videos)
  }

  protected async update(videoIds: string[], videos?: Video[]) {
    this.logger.debug(`> Update videos: (${videoIds.length}) ` + JSON.stringify(videoIds))
    if (videoIds.length === 0) {
      this.logger.debug('> Skip')
      return
    }

    // api を叩く (return { videoId: item | null })
    const apiVideos = await this.youtube.fetchVideoList(videoIds)
    if (!apiVideos) {
      throw new Error('Youtube API failure')
    }

    // dbVideo の map を生成する (return { videoId: item })
    const dbVideos = ArrayToObject<Video>(videoIds, videos, (e) => e.videoId)

    // ID 基準で処理していく
    let idx = 1
    const length = videoIds.length
    for (const videoId of videoIds) {
      const db = dbVideos[videoId] || null // null なら db に存在しない新規動画
      const api = apiVideos[videoId] || null // null なら 削除された動画
      this.logger.trace(`[${idx++}/${length}] videoId: ${videoId} (db:${Boolean(db)}, api: ${Boolean(api)})`)

      if (api) {
        // API の値があるなら upsert (restore もする)
        this.logger.trace(`> [${videoId}] upsert`)
        const v = db || new Video()
        v.assignAPI(api)
        v.removeDeleteFlag()
        await v.save()
      } else {
        // API の値が無くて, db があるなら削除処理
        if (db) {
          this.logger.trace(`> [${videoId}] delete`)
          db.setDeleteFlag()
          await db.save()
        } else {
          this.logger.trace(`> [${videoId}] do nothing`)
        }
      }
    }

    this.logger.debug('> Success')
  }
}
