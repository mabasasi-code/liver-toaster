import dateformat from 'dateformat'
import { TwitterAPI } from '../../bootstrap';
import VideoInterface from '../interface/database/VideoInterface';
import { Log } from '../../logger/Logger';

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
    const time = video.scheduledStartTime
      ? dateformat(video.scheduledStartTime, 'HH:MM ~')
      : '--:--'
    const url = video.videoId
      ? 'https://youtu.be/' + video.videoId
      : '-URL不明-'

    const lines = [
      dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      '🌾「配信予定だよ！」',
      this.stringEscape(video.title || '-タイトル不明-', 80),
      '⏰: ' + time,
      url,
    ]
    await this.tweet(lines.join('\n'))
  }

  public static async startLiveStreaming(video: VideoInterface) {
    const time = video.actualStartTime
      ? dateformat(video.actualStartTime, 'HH:MM ~')
      : '--:--'
    const url = video.videoId
      ? 'https://youtu.be/' + video.videoId
      : '-URL不明-'

    const lines = [
      dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      '🌾「配信が始まったよ！」',
      this.stringEscape(video.title || '-タイトル不明-', 80),
      '⏰: ' + time,
      url,
    ]
    await this.tweet(lines.join('\n'))
  }

  public static async endLiveStreaming(video: VideoInterface) {
    const start = video.actualStartTime
      ? dateformat(video.actualStartTime, 'HH:MM')
      : '--:--'
    const end = video.actualEndTime
      ? dateformat(video.actualEndTime, 'HH:MM')
      : '--:--'
    const time = '⏰: ' + start + ' ~ ' + end
    const url = video.videoId
      ? 'https://youtu.be/' + video.videoId
      : '-URL不明-'

    const lines = [
      dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      '🌾「配信が終わったよ！」',
      this.stringEscape(video.title || '-タイトル不明-', 80),
      '⏰: ' + time,
      url,
    ]
    await this.tweet(lines.join('\n'))
  }

  ///

  protected static async tweet (text: string) {
    const tweet = await TwitterAPI.postTweet(text)
    const stub = TwitterAPI.isStubMode() ? '(stub)' : ''
    Log.info(`> tweet ${stub}\n${tweet.text}[EOL]`)
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
}
