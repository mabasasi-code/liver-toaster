import dateformat from 'dateformat'
import twitter from './api/twitter'

// {
//   type, source_device_iden, source_user_iden, client_version, dismissible,
//   icon, title, body, image, application_name, package_name, notification_id, notification_tag, actions
// }

const stringEscape = function (val = '', limit = 100) {
  // twitter で反応する記号を全角に
  const escapeStr = val
    .replace(/#/g, '＃')
    .replace(/@/g, '＠')

  // 現状 100 文字に切り詰める
  const limitStr = escapeStr.substr(0, limit)

  return limitStr
}

const tweet = async function (text) {
  const res = await twitter.postTweet(text)
  console.log('> tweet'.padEnd(40, '-'))
  console.log(res.text)
  console.log('> '.padEnd(40, '-'))
  return res
}

///

const notifyTest = async function (post) {
  const now = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
  const mes = stringEscape('通知のテストです')

  const text = `${now}\n${mes}`
  await tweet(text)
}

const scheduleStreaming = async function (video) {
  const now = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
  const serif = '🌾「配信予定だよ！」'
  const title = stringEscape(video.title || '-タイトル不明-', 90)
  const time = video.scheduledStartTime
    ? '⏰ 時間: ' + dateformat(video.scheduledStartTime, 'HH:MM ~')
    : '-時間不明-'
  const url = video.videoId
    ? 'https://youtu.be/' + video.videoId
    : '-URL不明-'

  const text = `${now}\n${serif}\n${title}\n${time}\n${url}`
  await tweet(text)
}

const startLiveStreaming = async function (video) {
  const now = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
  const serif = '🌾「配信が始まったよ！」'
  const title = stringEscape(video.title || '-タイトル不明-', 100)
  const url = video.videoId
    ? 'https://youtu.be/' + video.videoId
    : '-URL不明-'

  const text = `${now}\n${serif}\n${title}\n${url}`
  await tweet(text)
}

const endLiveStreaming = async function (video) {
  const now = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
  const serif = '🌾「配信が終わったよ！」'
  const title = stringEscape(video.title || '-タイトル不明-', 80)
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

  const text = `${now}\n${serif}\n${title}\n${time}\n${url}`
  await tweet(text)
}

///

export default {
  notifyTest,
  scheduleStreaming,
  startLiveStreaming,
  endLiveStreaming,
}
