import PushBullet from 'pushbullet'
import pushDump from './lib/pushDump'
import pushHandle from './lib/pushHandle'
import twitter from './lib/twitters/twitter'
import config from './config/index'

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
      // push message received
      if (config.listenMode) {
        pushDump(push)
      }

      if (push.type === 'mirror') {
        if (!config.listenMode) pushDump(push) // dump してないならする
        await pushHandle(push)
      }
    } catch (err) {
      console.error(err)
    }
  })
})
