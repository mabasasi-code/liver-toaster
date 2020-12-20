import dateformat from 'dateformat'
import diffDates from 'diff-dates'
import { TwitterAPI } from '../../bootstrap'
import config from '../../config/config'
import { EventLog } from '../../logger/Logger'
import Video from '../../model/Video'
import TweetInterface from '../../interface/twitter/TweetInterface'
import Channel from '../../model/Channel'
import CommunityDomInterface from '../../interface/youtube/CommunityDomInterface'
import Checker from './Checker'

export default class Tweeter {
  protected isMute: boolean = false

  public static builder() {
    return new this()
  }

  public static silent(isMute: boolean = true) {
    const inst = this.builder()
    inst.isMute = isMute
    return inst
  }

  public silent(isMute: boolean = true) {
    this.isMute = isMute
    return this
  }

  protected async tweet(text: string, inReplyTweetId?: string) {
    if (config.mode.disableTweet) this.isMute = true // env 指定があったら強制ミュート

    let tweet: TweetInterface
    if (!this.isMute) {
      tweet = await TwitterAPI.postTweet(text, inReplyTweetId)
    } else {
      tweet = { id_str: '0', text: text, in_reply_to_status_id_str: inReplyTweetId }
    }

    const stub = this.isMute ? ' (stub)' : ''
    const reply = inReplyTweetId ? ` => ${inReplyTweetId}` : ''
    EventLog.info(`> tweet${reply}${stub}\n${tweet.text} [EOL]`)

    return tweet
  }

  /// ////////////////////////////////////////////////////////////
  // test

  public async simpleTweet(text: string, inReplyTweetId?: string) {
    const lines = [
      dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      this.stringEscape(text, 130)
    ]
    return await this.tweet(lines.join('\n'), inReplyTweetId)
  }

  public async testNotify() {
    const lines = [
      dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      this.stringEscape('通知のテストです')
    ]
    return await this.tweet(lines.join('\n'))
  }

  /// ////////////////////////////////////////////////////////////
  // video stream
  // メンバーは video param かどうかで判断する

  public async postVideo(video: Video) {
    const lines = [dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')]
    if (!video.isMemberOnly) {
      lines.push('🌾「📼 動画投稿したよ」')
      lines.push(this.stringEscape(video.title || '-タイトル不明-', 80))
      lines.push('⏰: ' + this.timeString(video.publishedAt))
      lines.push(video.url('-URL不明-'))
    } else {
      lines.push('🌾「📼 メンバー限定の投稿があったよ！」')
      lines.push(video.channelUrl('community' ,'-URL不明-'))
    }

    return await this.tweet(lines.join('\n'))
  }

  public async scheduleStreaming(video: Video) {
    const lines = [dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')]
    if (!video.isMemberOnly) {
      lines.push('🌾「📅 配信予定だよ！」')
      lines.push(this.stringEscape(video.title || '-タイトル不明-', 80))
      lines.push('⏰: ' + this.timeString(video.scheduledStartTime))
      lines.push(video.url('-URL不明-'))
    } else {
      lines.push('🌾「📅 メンバー限定の投稿があったよ！」')
      lines.push(video.channelUrl('community' ,'-URL不明-'))
    }

    return await this.tweet(lines.join('\n'))
  }

  public async startLiveStreaming(video: Video) {
    const lines = [dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')]
    let inReply = undefined

    if (!video.isMemberOnly) {
      lines.push('🌾「🔴 配信が始まったよ！」')
      lines.push(this.stringEscape(video.title || '-タイトル不明-', 80))
      lines.push('⏰: ' + this.timeString(video.actualStartTime))
      lines.push(video.url('-URL不明-'))
    } else {
      // sche ツイがあるならリプライにする
      if (video.scheduleTweetId) {
        inReply = video.scheduleTweetId
      }

      lines.push('🌾「🔴 メンバー限定の投稿があったよ！」')
      lines.push(video.channelUrl('community' ,'-URL不明-'))
    }

    return await this.tweet(lines.join('\n'), inReply)
  }

  public async endLiveStreaming(video: Video) {
    // 終了ツイはリプライにする

    const lines = [dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')]
    if (!video.isMemberOnly) {
      lines.push('🌾「配信が終わったよ！」')
      lines.push(this.stringEscape(video.title || '-タイトル不明-', 80))
    }
    lines.push('⏰: ' + this.timeString(video.actualStartTime, video.actualEndTime, true))

    return await this.tweet(lines.join('\n'), video.startTweetId)
  }

  /// ////////////////////////////////////////////////////////////
  // youtube community

  public async postCommunity(channel: Channel, post: CommunityDomInterface) {
    // 動画系は上の stream api を使って

    // url は 全体の community にしておく
    // 個々リンクは https://www.youtube.com/channel/UCxxx/community?lb=<postId>

    const isMember = Checker.isMemberPost(post)
    const type = Checker.getPostType(post)
    const pref = type === 'image' ? '🎨 ' : ''
    if (type === 'video') {
      throw SyntaxError(`This post use streaming() id: ${post.postId}`)
    }

    const lines = [dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')]
    if (!isMember) {
      lines.push(`🌾「${pref}コミュニティに投稿があったよ！」`)
    } else {
      lines.push(`🌾「${pref}メンバー限定の投稿があったよ！」`)
    }
    lines.push(channel.url('community' ,'-URL不明-'))
    return await this.tweet(lines.join('\n'))
  }

  /// ////////////////////////////////////////////////////////////
  // achive

  public async achiveChannelOfSubscriber(channel: Channel, achiveSubscriber: number) {
    const num = achiveSubscriber.toLocaleString()
    const lines = [dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')]
    lines.push(`🏆「${channel.title}」チャンネルの登録者数が ${num} 人になりました`)
    lines.push(channel.url(null ,'-URL不明-'))

    return await this.tweet(lines.join('\n'))
  }

  /// ////////////////////////////////////////////////////////////

  protected stringEscape (text: string, limit: number = 100): string {
    // twitterで反応する記号を無効に
    const escapeText = text
      .replace(/#/g, '# ')
      .replace(/@/g, '@ ')

    // 文字を切り詰める
    const limitText = escapeText.substr(0, limit)

    return limitText
  }

  protected timeString(startDate?: Date, endDate?: Date, showEnd: boolean = false) {
    const start = startDate ? dateformat(startDate, 'HH:MM') : '--:--'

    let text = start + ' ~'
    if (showEnd) {
      const end = endDate ? dateformat(endDate, 'HH:MM') : '--:--'

      const minutes = diffDates(endDate, startDate, 'minutes')
      text += ' ' + end + ' (' + minutes +' 分)'
    }
    return text
  }
}
