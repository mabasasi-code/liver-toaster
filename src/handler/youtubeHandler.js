import config from "../config"
import tweeter from "../lib/tweeter"
import videoStore from "../lib/videoStore"

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
          await videoHandling(videoId)
        }
      } else {
        // 指定されてないならとりあえず全部
        await videoHandling(videoId)
      }
    } else if (title.startsWith(TITLE_PREFIX)) {
      // 配信開始 通知
      console.log('> live streaming notify')

      if (config.youtube.channelName) {
        // チャンネル名が指定されてるなら完全一致とする
        if (title === TITLE_PREFIX + config.youtube.channelName) {
          await videoHandling(videoId)
        }
      } else {
        // 指定されてないならとりあえず全部
        await videoHandling(videoId)
      }
    } else {
      console.log('> other notify')
      // その他、動画とかの可能性も
    }
  } catch (err) {
    console.error(err)
  }
}

///

const videoHandling = async function (videoId) {
  console.log('> videoId: ' + videoId)

  // video を取り出して更新
  const video = await videoStore.findVideoAndUpdate(videoId)
  console.log('> video: ' + JSON.stringify(video))

  if (!video) {
    // TODO: api で video が取れなかったときの処理
    // TODO: 正常終了時だし削除されてるかも？
    console.log('> api fallure')
    return
  }

  // 配信が始まってなくて、予定ツイをしてなさそうならする
  if (!video.actualEndTime) {
    if (video.notifySchedule) {
      console.log('> already schedule tweet')
    } else {
      await tweeter.scheduleStreaming(video)
      video.notifySchedule = true
    }
  }

  // 配信中で、開始ツイをしてなさそうならする
  if (video.actualStartTime && !video.actualEndTime) {
    if (video.notifyStart) {
      console.log('> already start tweet')
    } else {
      await tweeter.startLiveStreaming(video)
      video.notifyStart = true
    }
  }

  // DB に保存する
  await videoStore.upsertVideo(video)
  console.log('> success!')
}
