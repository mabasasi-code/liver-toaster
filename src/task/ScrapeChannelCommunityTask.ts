import Channel from '../model/Channel'
import YoutubeChannelCommunity from '../lib/scraper/YoutubeChannelCommunity'
import { Logger } from 'log4js'
import UpdateVideoTask from './UpdateVideoTask'
import Youtube from '../lib/api/Youtube'
import Tweeter from '../lib/util/Tweeter'
import CommunityDomInterface from '../interface/youtube/CommunityDomInterface'
import { get } from 'dot-prop'
import Video from '../model/Video'

export default class ScrapeChannelCommunityTask {
  protected logger: Logger
  protected youtubeChannelCommunity: YoutubeChannelCommunity
  protected updateVideoTask: UpdateVideoTask

  constructor (youtube: Youtube, logger: Logger) {
    this.logger = logger
    this.youtubeChannelCommunity = new YoutubeChannelCommunity()
    this.updateVideoTask = new UpdateVideoTask(youtube, logger)
  }

  public async scrapeFirst(channel: Channel, loadCookie: boolean = false) {
    const channelId = channel.channelId
    const latestPostId = channel.latestPostId // null なら一度も取得していない
    const latestMemberPostId = channel.latestMemberPostId // null なら一度も取得していない

    this.logger.debug(`> Scrape community: ${channelId} (cookie: ${loadCookie})`)

    // 先頭の post を取得
    const post = await this.youtubeChannelCommunity.getPostFirst(channelId, loadCookie)
    if (!post) {
      throw new Error('Web scrape failure')
    }

    const postId = post.postId
    const isMember = Boolean(post.sponsorsOnlyBadge)
    const type = this.checkPostType(post)
    this.logger.trace(`> [${postId}] type: ${type}, isMember: ${isMember}`)

    // post と channel.post の確認 & 更新
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

  ///

  protected checkPostType(post: CommunityDomInterface): 'video' | 'image' | 'text' {
    const backStage = post.backstageAttachment
    if (backStage) {
      if (backStage.videoRenderer) {
        return 'video'
      } else if (backStage.backstageImageRenderer) {
        return 'image'
      }
    }
    return 'text'
  }
}
