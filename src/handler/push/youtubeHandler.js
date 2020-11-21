import config from '../../config'
import tweeter from '../../lib/tweeter'
import videoHandler from '../youtube/videoHandler'

const TITLE_PREFIX = '🔴 '
const TITLE_SCHEDULE_PREFIX = '🔴 30 分後に '
const TITLE_MEMBER_SUFFIX = ' さんからのメンバー限定の投稿'

export default async function (push) {
  // youtube は暫く出力する
  console.log(push)

  try {
    const title = push.title || ''
    const videoId = push.notification_tag

    // 前方一致は スケジュール 通知
    if (title.startsWith(TITLE_SCHEDULE_PREFIX)) {
      await scheduleNotify(title, videoId, push) // 🔴 配信予定通知
    } else if (title.startsWith(TITLE_PREFIX)) {
      await liveNotify(title, videoId, push) // 🔴 配信開始通知
    } else if (title.endsWith(TITLE_MEMBER_SUFFIX)) {
      await memberNotify(title, videoId, push) // メンバー限定の通知
    } else {
      // その他、動画とかの可能性も
      console.log('> other notify')
    }
  } catch (err) {
    console.error(err)
  }
}

///

const scheduleNotify = async function (title, videoId, push) {
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
}

const liveNotify = async function (title, videoId, push) {
  console.log('> live notify')

  if (config.youtube.channelName) {
    // チャンネル名が指定されてるなら完全一致とする
    if (title === TITLE_PREFIX + config.youtube.channelName) {
      await videoHandler(videoId)
    }
  } else {
    // 指定されてないならとりあえず全部
    await videoHandler(videoId)
  }
}

const memberNotify = async function (title, videoId, push) {
  console.log('> member notify')

  await tweeter.memberCommunity()
}
