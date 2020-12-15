import { Logger } from 'log4js'
import { mapSeries } from 'p-iteration'
import { IsNull } from 'typeorm'
import Youtube from '../../api/Youtube'
import ArrayToObject from '../../util/ArrayToObject'
import Loggable from '../../util/Loggable'
import Video from '../../../model/Video'

export default class UpdateVideoTask extends Loggable {
  protected youtube: Youtube

  constructor (logger: Logger, youtube: Youtube) {
    super(logger)

    this.youtube = youtube
  }

  public async updateById(videoId: string) {
    return await this.updateByIds([videoId])
  }

  public async updateByIds(videoIds: string[]) {
    const dbVideos = await mapSeries(videoIds, async (id) => {
      const video = await Video.findOne({ videoId: id })
      return video
    })
    await this.update(videoIds, dbVideos)
  }

  public async updateByVideos(videos: Video[]) {
    const videoIds = videos.map(e => e.videoId)
    await this.update(videoIds, videos)
  }

  public async updateMonitoringVideos() {
    // db から処理対象っぽい動画を全部取り出す
    const dbVideos = await Video.find({ endTweetId: IsNull(), deletedAt: IsNull() })
    await this.updateByVideos(dbVideos)
  }

  /// ////////////////////////////////////////////////////////////

  protected async update(videoIds: string[], videos?: Video[]) {
    this.logger.debug(`Update videos: (${videoIds.length}) ` + JSON.stringify(videoIds))
    if (videoIds.length === 0) {
      this.logger.debug('> Skip')
      return false
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
      this.logger.debug(`[${idx++}/${length}] vid: ${videoId} (db:${Boolean(db)}, api: ${Boolean(api)})`)

      if (api) {
        // API の値があるなら upsert (restore もする)
        const vi = db || new Video()
        vi.assignAPI(api)
        vi.removeDeleteFlag()

        this.logger.trace(`> upsert: [${videoId}] ${vi.title}`)
        await vi.save()
      } else {
        // API の値が無くて, db があるなら削除処理
        if (db) {
          const vi = db
          vi.setDeleteFlag()

          this.logger.trace(`> delete: [${videoId}] ${vi.title}`)
          await db.save()
        } else {
          // 実行されないはず
          this.logger.warn(`> skip: [${videoId}] => no data`)
        }
      }
    }

    return true
  }
}
