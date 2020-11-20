import config from '../config'
import videoHandler from '../lib/video/videoHandler'

const TITLE_PREFIX = '🔴 '
const TITLE_SCHEDULE_PREFIX = '🔴 30 分後に '

export default async function (push) {
  // youtube は暫く出力する
  console.log(push)

  try {
    const title = push.title
    const videoId = push.notification_tag

    // schedule 通知か 配信開始通知か 確認
    if (title.startsWith(TITLE_SCHEDULE_PREFIX)) {
      // スケジュール 通知
      console.log('> schedule notify')

      if (config.youtube.channelName) {
        // チャンネル名が指定されてるなら前方一致
        if (title.startsWith(TITLE_SCHEDULE_PREFIX + config.youtube.channelName)) {
          await videoHandler(videoId)
        }
      } else {
        // 指定されてないならとりあえず全部
        await videoHandler(videoId)
      }
    } else if (title.startsWith(TITLE_PREFIX)) {
      // 配信開始 通知
      console.log('> live streaming notify')

      if (config.youtube.channelName) {
        // チャンネル名が指定されてるなら完全一致とする
        if (title === TITLE_PREFIX + config.youtube.channelName) {
          await videoHandler(videoId)
        }
      } else {
        // 指定されてないならとりあえず全部
        await videoHandler(videoId)
      }
    } else {
      console.log('> other notify')
      // その他、動画とかの可能性も
    }
  } catch (err) {
    console.error(err)
  }
}
