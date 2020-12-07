import PushInterface from '../../interface/pushbullet/PushInterface';
import { NotifyLog } from '../../logger/Logger';

export default abstract class BasePushHandler {
  public abstract isValid(push: PushInterface): boolean
  public abstract handle(push: PushInterface): Promise<void>

  ///

  public dump(push: PushInterface) {
    const device = push.source_device_iden || 'unknown device'
    const packageName = push.package_name || 'unknown package'
    const type = push.type || 'unknown'
    const title = push.title || 'unknown message'
    const text = push.body ? ': ' + this.simpleString(push.body, 80) : ''

    NotifyLog.info(`[${device}][${packageName}][${type}] ${title}${text}`)
  }

  protected simpleString(value: any, limit: number = 200) {
    const text = (value || '').replace(/\r?\n/g, '\\n').substr(0, limit)
    return text
  }
}
