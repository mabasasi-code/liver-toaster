import tweeter from './tweeter'
import config from '../config/index'

const PUSHBULLET_PACKAGE_NAME = 'com.pushbullet.android'
const YOUTUBE_PACKAGE_NAME = 'com.google.android.youtube'

const PUSHBULLET_NOTIFY_TITLE = '通知のテスト'
const TITLE_PREFIX = '🔴 '

const handle = async function (post) {
  // test
  if (post.package_name === PUSHBULLET_PACKAGE_NAME) {
    if (post.title === PUSHBULLET_NOTIFY_TITLE) {
      await tweeter.notifyTest(post)
    }
  }

  // youtube
  if (post.package_name === YOUTUBE_PACKAGE_NAME) {
    console.log(post)

    // チャンネル名が指定されてるなら完全一致, それ以外は前方一致
    if (config.youtube.channelName) {
      const emojiTitle = TITLE_PREFIX + config.youtube.channelName
      if (post.title === emojiTitle) {
        await tweeter.startLiveStreaming(post)
      }
    } else {
      if ((post.title || '').startsWith(TITLE_PREFIX)) {
        await tweeter.startLiveStreaming(post)
      }
    }
  }
}

export default handle
