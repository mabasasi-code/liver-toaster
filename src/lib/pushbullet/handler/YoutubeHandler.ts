import PushInterface from "../../interface/pushbullet/PushInterface";
import Tweeter from "../../util/Tweeter";
import BasePushHandler from "./BasePushHandler";
import BaseYoutubeHandler from "./youtube/BaseYoutubeHandler";
import LiveHandler from "./youtube/LiveHandler";

export class YoutubeHandler extends BasePushHandler {
  public readonly YOUTUBE_PACKAGE_NAME = 'com.google.android.youtube'

  private handlers: BaseYoutubeHandler[]

  constructor() {
    super()
    this.handlers = []
    this.handlers.push(new LiveHandler())
  }

  public isValid(push: PushInterface): boolean {
    if (push.package_name === this.YOUTUBE_PACKAGE_NAME) {
      return true
    }

    return false
  }

  public async handle(push: PushInterface): Promise<void> {
    // 先頭からどれか一つ実行する (try-catch も上位に任せる)
    for (const handler of this.handlers) {
      const isValid = handler.isValid(push)
      if (isValid) {
        await handler.handle(push)
        return
      }
    }

    await Tweeter.testNotify()
  }
}
