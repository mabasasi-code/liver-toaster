import config from "../../../config/Index";
import PushInterface from "../../../interface/pushbullet/PushInterface";
import PushHandler from "./PushHandler";

export class TestHandler extends PushHandler {
  public readonly NOTIFY_TITLE = '通知のテスト'

  public isValid(push: PushInterface): boolean {
    // config でテスト通知が off なら対象外
    if (!config.mode.testNotify)  return false

    // タイトルが一致したら対象
    if (push.title === this.NOTIFY_TITLE) {
      return true
    }

    return false
  }

  public async handle(push: PushInterface): Promise<void> {
    console.log('てすとっぽい')
  }
}
