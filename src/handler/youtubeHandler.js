import config from "../config"
import tweeter from "../lib/tweeter"

const TITLE_PREFIX = '🔴 '

export default async function (push) {
  // youtube は暫く出力する
  console.log(push)

  // チャンネル名が指定されてるなら完全一致, それ以外は前方一致 を対象に
  if (config.youtube.channelName) {
    const emojiTitle = TITLE_PREFIX + config.youtube.channelName
    if (push.title === emojiTitle) {
      await tweeter.startLiveStreaming(push)
    }
  } else {
    if ((push.title || '').startsWith(TITLE_PREFIX)) {
      await tweeter.startLiveStreaming(push)
    }
  }
}
