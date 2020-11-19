import PushBullet from 'pushbullet'
import Twitter from './lib/twitters/twitter'

const PUSHBULLET_ACCESS_TOKEN = process.env.PUSHBULLET_ACCESS_TOKEN
const PUSHBULLET_ENCRYPTION_KEY = process.env.PUSHBULLET_ENCRYPTION_KEY

// https://github.com/alexwhitman/node-pushbullet-api
const pusher = new PushBullet(PUSHBULLET_ACCESS_TOKEN)

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
          const message = (new Date() + '\n' + push.title + '\n' + push.body).substr(0, 140)
          console.log('> test tweet ---------')
          console.log('>' + message)
          console.log('> --------------------')
          await Twitter.postTweet(message)
        }
        if (push.package_name === 'com.google.android.youtube') {
          console.log('> youtube ############')
          console.log(push)
          const message = (new Date() + '\n' + push.title + '\n' + push.body).substr(0, 140)
          console.log('> youtube tweet ------')
          console.log('>' + message)
          console.log('> --------------------')
          await Twitter.postTweet(message)
        }
      } catch (error) {
        console.error(error)
      }
    }
  })
})

const simpleString = function (str, len) {
  const text = (str || '').replace(/\r?\n/g, "").substr(0, len)
  return text
}
