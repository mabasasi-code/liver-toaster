import dateformat from 'dateformat'
import diffDates from 'diff-dates'
import { TwitterAPI } from '../../bootstrap';
import { Log } from '../../logger/Logger';
import VideoInterface from '../interface/database/VideoInterface';

export default class Tweeter {
  public static async testNotify() {
    const lines = [
      dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      this.stringEscape('通知のテストです')
    ]
    await this.tweet(lines.join('\n'))
  }

  public static async postMemberCommunity(channelId?: string) {
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

  public static async scheduleStreaming(video: VideoInterface) {
    const url = video.videoId
      ? 'https://youtu.be/' + video.videoId
      : '-URL不明-'

    const lines = [
      dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      '🌾「📅 配信予定だよ！」',
      this.stringEscape(video.title || '-タイトル不明-', 80),
      this.timeString(video.scheduledStartTime),
      url,
    ]
    await this.tweet(lines.join('\n'))
  }

  public static async startLiveStreaming(video: VideoInterface) {
    const url = video.videoId
      ? 'https://youtu.be/' + video.videoId
      : '-URL不明-'

    const lines = [
      dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      '🌾「🔴 配信が始まったよ！」',
      this.stringEscape(video.title || '-タイトル不明-', 80),
      this.timeString(video.actualStartTime),
      url,
    ]
    await this.tweet(lines.join('\n'))
  }

  public static async endLiveStreaming(video: VideoInterface) {
    const url = video.videoId
      ? 'https://youtu.be/' + video.videoId
      : '-URL不明-'

    const lines = [
      dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      '🌾「配信が終わったよ！」',
      this.stringEscape(video.title || '-タイトル不明-', 80),
      this.timeString(video.actualStartTime, video.actualEndTime, true),
      url,
    ]
    await this.tweet(lines.join('\n'))
  }

  ///

  protected static async tweet (text: string) {
    const tweet = await TwitterAPI.postTweet(text)
    const stub = TwitterAPI.isStubMode() ? ' (stub)' : ''
    Log.info(`> tweet${stub}\n${tweet.text} [EOL]`)
  }

  protected static stringEscape (text: string, limit: number = 100): string {
    // twitterで反応する記号を無効に
    const escapeText = text
      .replace(/#/g, '＃')
      .replace(/@/g, '＠')

    // 文字を切り詰める
    const limitText = escapeText.substr(0, limit)

    return limitText
  }

  protected static timeString(startStr?: string, endStr?: string, showEnd: boolean = false) {
    const startDate = new Date(startStr)
    const start = startStr ? dateformat(startDate, 'HH:MM') : '--:--'

    let text = '⏰: ' + start + ' ~'
    if (showEnd) {
      const endDate = new Date(endStr)
      const end = endStr ? dateformat(endDate, 'HH:MM') : '--:--'

      const minutes = diffDates(endDate, startDate, 'minutes')
      text += ' ' + end + ' (' + minutes +' 分)'
    }
    return text
  }
}
