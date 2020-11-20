import dateformat from 'dateformat'
import twitter from './twitters/twitter'

// {
//   type, source_device_iden, source_user_iden, client_version, dismissible,
//   icon, title, body, image, application_name, package_name, notification_id, notification_tag, actions
// }

const stringEscape = function (val = '') {
  // twitter で反応する記号を全角に
  const escape = val
    .replace(/#/g, '＃')
    .replace(/@/g, '＠')

  // 現状 100 文字に切り詰める
  const limit = escape.substr(0, 100)

  return limit
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

const startLiveStreaming = async function (post) {
  const now = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
  const mes = '🌾「配信が始まったよ！」'
  const title = stringEscape(post.body || '-タイトル不明-')
  const url = post.notification_tag
    ? 'https://youtu.be/' + post.notification_tag
    : '-URL不明-'

  const text = `${now}\n${mes}\n${title}\n${url}`
  await tweet(text)
}

///

export default {
  notifyTest,
  startLiveStreaming,
}
