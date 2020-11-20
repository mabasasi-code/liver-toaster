import PushBullet from 'pushbullet'
import Twitter from './lib/twitters/twitter'

const PUSHBULLET_ACCESS_TOKEN = process.env.PUSHBULLET_ACCESS_TOKEN
const PUSHBULLET_ENCRYPTION_KEY = process.env.PUSHBULLET_ENCRYPTION_KEY

// https://github.com/alexwhitman/node-pushbullet-api
const pusher = new PushBullet(PUSHBULLET_ACCESS_TOKEN)

///

const simpleString = function (str, len) {
  const text = (str || '').replace(/\r?\n/g, "\\n").substr(0, len)
  return text
}

const tweet = async function (push, name) {
  const message = (new Date() + '\n' + push.title + '\n' + push.body).substr(0, 140)
  console.log(('> test ' + name).padEnd(20, '-'))
  console.log('>' + message)
  console.log(('> ').padEnd(20, '-'))
  await Twitter.postTweet(message)
}

///

pusher.me(function(error, user) {
	// needed to call me() to gather user iden
	pusher.enableEncryption(PUSHBULLET_ENCRYPTION_KEY, user.iden)

	var stream = pusher.stream()

  stream.connect()

  stream.on('connect', function() {
    // stream has connected
    console.log('> listen ...')
  })

  stream.on('push', async function (push) {
    // push message received
    // console.log(push)
    const datetime = new Date().toLocaleString()
    const text = simpleString(push.body, 80)
    console.log(`${datetime} [${push.source_device_iden}][${push.type}][${push.package_name}] ${push.title}: ${text}`)

    if (push.type === 'mirror') {
      try {
        if (push.package_name === 'com.pushbullet.android') {
          console.log(push)
          await tweet(push)
        }
        if (push.package_name === 'com.google.android.youtube') {
          console.log(push)
          await tweet(push)
        }
      } catch (error) {
        console.error(error)
      }
    }
  })
})
