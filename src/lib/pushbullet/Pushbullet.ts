import PushbulletAPI from 'pushbullet'
import PushInterface from '../../interface/pushbullet/PushInterface'
import TwitterUserInterface from '../../interface/twitter/UserInterface'
import PushHandler from './PushHandler'
import { TwitterAPI } from '../../bootstrap'
import UserInterface from '../../interface/pushbullet/UserInterface'
import config from '../../config/config'
import Loggable from '../util/Loggable'
import { Logger } from 'log4js'

export default class Pushbullet extends Loggable {
  private accessToken: string
  private encryptionKey: string

  private retry: boolean = false // リトライ中かどうか

  protected stream: any
  protected handler: PushHandler

  constructor (logger: Logger, accessToken: string, encryptionKey: string = null) {
    super(logger)

    this.accessToken = accessToken
    this.encryptionKey = encryptionKey
    this.handler = new PushHandler(logger, config.mode.dumpAllNotify)
  }

  public async run() {
    const stream = this.stream || await this.initStream()
    stream.connect()
    return stream
  }

  public async stop() {
    const stream = this.stream
    if (stream) {
      stream.close()
    }
  }

  protected async initStream(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const twuser = await TwitterAPI.getClientUser()

      const pusher = new PushbulletAPI(this.accessToken, {})
      pusher.me((error: any, user: UserInterface) => {
        if (error) reject(error)

        // 暗号化キー
        if (this.encryptionKey) {
          pusher.enableEncryption(this.encryptionKey, user.iden)
        }

        // ストリームを開く
        const stream = pusher.stream()

        stream.on('connect', async () => {
          try {
            this.dumpListenLog(user, twuser)
          } catch (err) {
            this.logger.error(err)
          }
        })

        stream.on('push', async (push: PushInterface) => {
          try {
            if (push.type === 'mirror') {
              await this.handler.invoke(push)
            }
          } catch (err) {
            this.logger.error(err)
          }
        })

        stream.on('error', (err: any) => {
          this.logger.error(err)
          stream.close()

          if (!this.retry) {
            this.retry = true
            this.logger.error('Stream closed. Try after 1 minutes')
            setTimeout(() => {
              this.retry = false
              stream.connect()
            }, 1 * 60 * 1000)
          }
        })

        // stream.on('close', (res: any) => {
        // })

        resolve(stream)
      })
    })
  }

  protected dumpListenLog(pushUser: UserInterface, twUser: TwitterUserInterface) {
    const device = (pushUser.name || '--') + ' (' + pushUser.iden + ')'
    const client = (twUser.name || '--') + ' (@' + (twUser.screen_name || '--') + ')'
    const target = config.youtube.channelName || 'all'

    this.logger.info('Stream connected!')
    this.logger.info('> device: ' + device)
    this.logger.info('> client: ' + client)
    this.logger.info('> setup: ' + JSON.stringify(config.mode))
    this.logger.info('> target: ' + target)
  }
}
