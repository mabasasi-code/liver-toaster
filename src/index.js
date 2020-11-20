import PushBullet from 'pushbullet'
import config from './config/index'
import twitter from './lib/api/twitter'
import handler from './handler/handler'

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
      const name = (user.name || '--') + '(@' + (user.screen_name || '--') + ')'

      console.log('> listen ...')
      console.log('> account: ' + name)
      console.log()
    } catch (err) {
      console.error(err)
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
