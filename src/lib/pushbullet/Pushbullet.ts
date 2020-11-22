import PushbulletAPI from 'pushbullet'
import PushInterface from '../../interface/pushbullet/PushInterface'
import UserInterface from '../../interface/pushbullet/UserInterface'
import PushHandler from './handler/PushHandler'
import { TestHandler } from './handler/TestHandler'

export default class Pushbullet {
  private accessToken: string
  private encryptionKey: string

  private handlers: PushHandler[]

  constructor (accessToken: string, encryptionKey: string = null) {
    this.accessToken = accessToken
    this.encryptionKey = encryptionKey

    this.handlers = []
    this.handlers.push(new TestHandler())
  }

  public async connect (): Promise<UserInterface> {
    return new Promise((resolve, reject) => {
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
          resolve(user)
        })

        stream.on('push', async (push: PushInterface) => {
          try {
            if (push.type === 'mirror') {
              await this.pushHandle(push)
            }
          } catch (err) {
            console.error(err)
          }
        })

        // stream.on('error', function(err: any) {
        //   if (errHandler) {
        //     errHandler(err)
        //   } else {
        //     throw new Error(err)
        //   }
        // })

        stream.connect()
      })
    })
  }

  public async pushHandle (push: PushInterface) {
      for (const handler of this.handlers) {
        try {
          const isValid = handler.isValid(push)
          if (isValid) await handler.handle(push)
        } catch (err) {
          console.error(err)
        }
      }
  }
}
