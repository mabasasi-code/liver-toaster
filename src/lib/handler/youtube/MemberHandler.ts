import config from '../../../config/config'
import { NotifyLog } from '../../../logger/Logger'
import PushInterface from '../../../interface/pushbullet/PushInterface'
import Tweeter from '../../util/Tweeter'
import BashYoutubeHandler from './BaseYoutubeHandler'
import ScrapeChannelCommunityTask from '../../../task/ScrapeChannelCommunityTask'
import UpdateVideoTask from '../../../task/UpdateVideoTask'
import { YoutubeAPI } from '../../../bootstrap'

export default class MemberHandler extends BashYoutubeHandler {
  public readonly TITLE_SUFFIX = ' さんからのメンバー限定の投稿'

  protected scrapeChannelCommunityTask: ScrapeChannelCommunityTask
  protected updateVideoTask: UpdateVideoTask

  constructor () {
    super()
    this.scrapeChannelCommunityTask = new ScrapeChannelCommunityTask()
    this.updateVideoTask = new UpdateVideoTask(YoutubeAPI, NotifyLog)
  }

  public isValid(push: PushInterface): boolean {
    const title = push.title || ''
    const channelName = config.youtube.channelName || ''

    // チャンネル名が指定されているなら完全一致、ないなら後方一致
    if (title.endsWith(channelName + this.TITLE_SUFFIX)) {
      return true
    }

    return false
  }

  public async handle(push: PushInterface): Promise<void> {
    NotifyLog.debug('> member notify')
    const channelId = config.youtube.channelId
    const body = push.body || ''

    // communiry を覗き見してくる
    const posts = await this.scrapeChannelCommunityTask.get(channelId, true)
    for (const post of posts) {
      // body が一致するやつを探す
      const postHeadText = ((post.contentText.runs[0] || {}).text).trim()
      if (body.startsWith(postHeadText) || postHeadText.startsWith(body)) {
        // 付属データがあるか
        const backStage = post.backstageAttachment
        if (backStage) {
          if (backStage.videoRenderer) {
            // 動画なら video task に渡す
            NotifyLog.debug('> member stream notify')
            const vid = backStage.videoRenderer.videoId
            this.updateVideoTask.updateById(vid)
            return
          } else if (backStage.backstageImageRenderer) {
            // 画像なら 画像ツイする
            NotifyLog.debug('> member picture notify')
            await Tweeter.builder().postMemberCommunityPicture(channelId)
            return
          }
        }

        // 何も一致しなかった場合、探索を打ち切る -> 通常処理
        break
      }
    }

    // どれも該当しない場合は通常ツイ
    await Tweeter.builder().postMemberCommunity(channelId)
  }
}