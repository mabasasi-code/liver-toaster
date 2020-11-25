import config from "../../../config/Index";
import PushInterface from "../../interface/pushbullet/PushInterface";
import { NotifyLog } from "../../../logger/Logger";
import BasePushHandler from "./BasePushHandler";

export default class DumpHandler extends BasePushHandler {
  public isValid(push: PushInterface): boolean {
    // config でログが off なら対象外
    if (!config.mode.loggingNotify)  return false

    return true
  }

  public async handle(push: PushInterface): Promise<void> {
    const device = push.source_device_iden || 'unknown device'
    const packageName = push.package_name || 'unknown package'
    const type = push.type || 'unknown'
    const title = push.title || 'unknown message'
    const text = push.body ? ': ' + this.simpleString(push.body, 80) : ''

    NotifyLog.info(`[${device}][${packageName}][${type}] ${title}${text}`)
  }

  ///

  protected simpleString(value: any, limit: number = 200) {
    const text = (value || '').replace(/\r?\n/g, "\\n").substr(0, limit)
    return text
  }
}
