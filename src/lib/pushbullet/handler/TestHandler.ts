import config from "../../../config/Index";
import PushInterface from "../../interface/pushbullet/PushInterface";
import { Log } from "../../../logger/Logger";
import Tweeter from "../../util/Tweeter";
import BasePushHandler from "./BasePushHandler";

export default class TestHandler extends BasePushHandler {
  public readonly PUSHBULLET_PACKAGE_NAME = 'com.pushbullet.android'
  public readonly NOTIFY_TITLE = '通知のテスト'

  public isValid(push: PushInterface): boolean {
    if (push.package_name === this.PUSHBULLET_PACKAGE_NAME) {
      // config でテスト通知が off なら対象外
      if (!config.mode.testNotify)  return false

      // タイトルが一致したら対象
      if (push.title === this.NOTIFY_TITLE) {
        return true
      }
    }

    return false
  }

  public async handle(push: PushInterface): Promise<void> {
    Log.debug('> test notify')
    await Tweeter.testNotify()
  }
}
