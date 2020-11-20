import config from "../config"
import tweeter from "../lib/tweeter"

const NOTIFY_TITLE = '通知のテスト'

export default async function (push) {
  // テスト通知 on でタイトルがテストなら対象に
  if (config.mode.testNotify) {
    if (push.title === NOTIFY_TITLE) {
      await tweeter.notifyTest(push)
    }
  }
}
