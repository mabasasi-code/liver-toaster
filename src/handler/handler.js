import config from "../config"
import dumpHandler from "./dumpHandler"
import pushbulletHandler from "./pushbulletHandler"
import youtubeHandler from "./youtubeHandler"

const PUSHBULLET_PACKAGE_NAME = 'com.pushbullet.android'
const YOUTUBE_PACKAGE_NAME = 'com.google.android.youtube'

export default async function (push = {}) {
  const packageName = push.package_name

  // listen モードなら dump
  if (config.mode.loggingNotify) {
    await dumpHandler(push)
  }

  // pushbullet app
  if (packageName === PUSHBULLET_PACKAGE_NAME) {
    await pushbulletHandler(push)
  }

  // youtube app
  if (packageName === YOUTUBE_PACKAGE_NAME) {
    await youtubeHandler(push)
  }
}
