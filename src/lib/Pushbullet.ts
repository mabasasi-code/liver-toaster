import PushbulletAPI from 'pushbullet'
import PushInterface from '../interface/pushbullet/PushInterface'
import TwitterUserInterface from '../interface/twitter/UserInterface'
import { Log } from '../logger/Logger'
import MessageHandler from './MessageHandler'
import { TwitterAPI } from '../bootstrap'
import UserInterface from '../interface/pushbullet/UserInterface'
import config from '../config/config'
import Scheduler from './Scheduler'

export default class Pushbullet {
  private accessToken: string
  private encryptionKey: string

  private scheduler: Scheduler
  private handler: MessageHandler
  private retry: boolean = false

  constructor (accessToken: string, encryptionKey: string = null) {
    this.accessToken = accessToken
    this.encryptionKey = encryptionKey

    this.scheduler = new Scheduler()
    this.handler = new MessageHandler(config.mode.dumpAllNotify)
  }

  public async connect() {
    const stream = await this.getStream()
    stream.connect()
    return stream
  }

  public getScheduler() {
    return this.scheduler
  }

  public async getStream(): Promise<any> {
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
            await this.scheduler.run()
          } catch (err) {
            Log.error(err)
          }
        })

        stream.on('push', async (push: PushInterface) => {
          try {
            if (push.type === 'mirror') {
              await this.handler.invoke(push)
            }
          } catch (err) {
            Log.error(err)
          }
        })

        stream.on('error', (err: any) => {
          Log.error(err)

          this.scheduler.stop()
          stream.close()

          if (!this.retry) {
            this.retry = true
            Log.error('Stream closed. Try after 1 minutes')
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

    Log.info('Stream connected!')
    Log.info('> device: ' + device)
    Log.info('> client: ' + client)
    Log.info('> setup: ' + JSON.stringify(config.mode))
    Log.info('> target: ' + target)
  }
}
