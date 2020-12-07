import dateformat from 'dateformat'
import diffDates from 'diff-dates'
import { TwitterAPI } from '../../bootstrap';
import config from '../../config/config';
import { EventLog } from '../../logger/Logger';
import Video from '../../model/Video';
import TweetInterface from '../../interface/twitter/TweetInterface';

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
    EventLog.info(`> tweet${stub}\n${tweet.text} [EOL]`)

    return tweet
  }

  ///

  public async testNotify() {
    const lines = [
      dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      this.stringEscape('通知のテストです')
    ]
    await this.tweet(lines.join('\n'))
  }

  public async postMemberCommunity(channelId?: string) {
    const url = channelId
      ? 'https://www.youtube.com/channel/' + channelId + '/community'
      : '-URL不明-'

    const lines = [
      dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      '🌾「メンバー限定の投稿があったよ！」',
      url,
    ]
    await this.tweet(lines.join('\n'))
  }

  ///

  public async scheduleStreaming(video: Video) {
    const lines = [
      dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      '🌾「📅 配信予定だよ！」',
      this.stringEscape(video.title || '-タイトル不明-', 80),
      '⏰: ' + this.timeString(video.scheduledStartTime),
      video.url('-URL不明-'),
    ]
    return await this.tweet(lines.join('\n'))
  }

  public async startLiveStreaming(video: Video) {
    const lines = [
      dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      '🌾「🔴 配信が始まったよ！」',
      this.stringEscape(video.title || '-タイトル不明-', 80),
      '⏰: ' + this.timeString(video.actualStartTime),
      video.url('-URL不明-'),
    ]
    return await this.tweet(lines.join('\n'))
  }

  public async endLiveStreamingReply(video: Video) {
    const lines = [
      dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      '🌾「配信が終わったよ！」',
      '⏰: ' + this.timeString(video.actualStartTime, video.actualEndTime, true),
    ]
    return await this.tweet(lines.join('\n'), video.startTweetId)
  }

  ///


  protected stringEscape (text: string, limit: number = 100): string {
    // twitterで反応する記号を無効に
    const escapeText = text
      .replace(/#/g, '＃')
      .replace(/@/g, '＠')

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
