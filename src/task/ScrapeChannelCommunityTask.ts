import Channel from '../model/Channel'
import YoutubeCommunityScraper from '../lib/scraper/YoutubeChannelCommunity'
import { Logger } from 'log4js'
import UpdateVideoTask from './UpdateVideoTask'
import Tweeter from '../lib/util/Tweeter'
import { get } from 'dot-prop'
import Video from '../model/Video'
import Checker from '../lib/util/Checker'
import { IsNull } from 'typeorm'
import delay from 'delay'

export default class CheckChannelCommunityTask {
  protected logger: Logger
  protected youtubeCommunityScraper: YoutubeCommunityScraper
  protected updateVideoTask: UpdateVideoTask

  constructor (updateVideoTask: UpdateVideoTask, logger: Logger) {
    this.logger = logger
    this.updateVideoTask = updateVideoTask
    this.youtubeCommunityScraper = new YoutubeCommunityScraper()
  }

  public async checkFirst(channel: Channel, loadCookie: boolean = false) {
    return await this.ckeck(channel, loadCookie)
  }

  public async checkMatchText(text: string, channel: Channel, loadCookie: boolean = false) {
    return await this.ckeck(channel, loadCookie, text)
  }

  public async checkMonitoringChannel(loadCookie: boolean = false) {
    // db から処理対象っぽい動画を全部取り出す
    const channels = await Channel.find({ deletedAt: IsNull() })
    for (const channel of channels) {
      await this.checkFirst(channel, loadCookie)
      await delay(1000)
    }
  }

  ///

  protected async ckeck(channel: Channel, loadCookie: boolean = false, text?: string) {
    const channelId = channel.channelId
    const latestPostId = channel.latestPostId // null なら一度も取得していない
    const latestMemberPostId = channel.latestMemberPostId // null なら一度も取得していない

    this.logger.debug(`> Check community: ${channelId} (cookie: ${loadCookie})`)

    // post を取得 (text があるなら検索)
    const post = text
      ? await this.youtubeCommunityScraper.findPost(text, channelId, loadCookie)
      : await this.youtubeCommunityScraper.getPostFirst(channelId, loadCookie)
    if (!post) {
      throw new Error('Web scrape failure')
    }

    const postId = post.postId
    const type = Checker.getPostType(post)
    const isMember = Checker.isMemberPost(post)
    this.logger.trace(`> [${postId}] type: ${type}, isMember: ${isMember}`)

    // post と channel.post の確認 & 更新
    // find() の時も先頭を参照しているはずなので ID を記録する
    if (isMember) {
      if (latestMemberPostId === postId) {
        // 既に取得済み
        this.logger.debug(`> [${postId}] already scraped`)
        return
      } else {
        channel.latestMemberPostId = postId
      }
    } else {
      if (latestPostId === postId) {
        // 既に取得済み
        this.logger.debug(`> [${postId}] already scraped`)
        return
      } else {
        channel.latestPostId = postId
      }
    }

    // 処理する
    try {
      if (type === 'video') {
        // db に存在しないなら保存
        const vid = get<string>(post, 'backstageAttachment.videoRenderer.videoId')
        const exist = await Video.count({ videoId: vid }) > 0
        if (!exist) {
          this.updateVideoTask.updateById(vid)
        } else {
          this.logger.debug(`> Stream already exist (id: ${vid})`)
        }
      } else if (type === 'image') {
        // 画像でつぶやく
        await Tweeter.builder().postMemberCommunityPicture(channelId)
      } else {
        // その他は通常つぶやき
        await Tweeter.builder().postMemberCommunity(channelId)
      }
    } catch (err) {
      this.logger.error(err)
    }

    // channel を更新する
    return await channel.save()
  }
}
