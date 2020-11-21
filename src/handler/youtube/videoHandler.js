import tweeter from '../../lib/tweeter'
import videoStore from '../../lib/store/video'

export default async function (videoId) {
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
  if (!video.actualStartTime && !video.actualEndTime) {
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

  // 配信が終わってて、終了ツイをしてなさそうならする
  if (video.actualStartTime && video.actualEndTime) {
    if (video.notifyEnd) {
      console.log('> already end tweet')
    } else {
      await tweeter.endLiveStreaming(video)
      video.notifyEnd = true
    }
  }


  // DB に保存する
  await videoStore.upsertVideo(video)
  console.log('> success!')
}
