import dateformat from 'dateformat'
import PushInterface from "../../interface/pushbullet/PushInterface";
import { Log } from '../../logger/Logger';
import Twitter from '../api/Twitter';

export default class Tweeter {
  public static client: Twitter

  public static async testNotify() {
    const line = [
      dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      Tweeter.stringEscape('通知のテストです')
    ]
    await Tweeter.tweet(line.join('\n'))
  }

  ///

  protected static async tweet (text: string) {
    if (!Tweeter.client) {
      throw new ReferenceError('Set Tweeter.client')
    }

    const tweet = await Tweeter.client.postTweet(text)
    const stub = Tweeter.client.isStubMode() ? '(stub)' : ''
    Log.debug(`> tweet ${stub}\n${tweet.text}[EOL]`)
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
