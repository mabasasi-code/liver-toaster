import PushBullet from 'pushbullet'
import config from './config/index'
import twitter from './lib/api/twitter'
import handler from './handler/push'

// https://github.com/alexwhitman/node-pushbullet-api
const pusher = new PushBullet(config.pushbullet.accessToken)

pusher.me(function (error, user) {
	pusher.enableEncryption(config.pushbullet.encryptionKey, user.iden)

	const stream = pusher.stream()
  stream.connect()

  stream.on('connect', async function () {
    try {
      // stream has connected
      const user = await twitter.getClientUser()
      showStartStatus(user)
    } catch (err) {
      console.error(err)
      process.exit(1) // 強制終了
    }
  })

  stream.on('push', async function (push) {
    try {
      const type = push.type
      if (type === 'mirror') {
        await handler(push)
      }
    } catch (err) {
      console.error(err)
    }
  })
})

///

const showStartStatus = function (user) {
  const name = (user.name || '--') + '(@' + (user.screen_name || '--') + ')'
  const target = config.youtube.channelName || 'all'

  console.log('listen ...')
  console.log('> account: ' + name)
  console.log('> setup: ' + JSON.stringify(config.mode))
  console.log('> target: ' + target)
  console.log()
}