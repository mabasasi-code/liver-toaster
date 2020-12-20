
import { CAC } from 'cac'
import { promises as fs } from 'fs'
import { YoutubeAPI } from '../bootstrap'
import config from '../config/config'
import PushHandler from '../lib/pushbullet/PushHandler'
import UpdateVideoTask from '../lib/task/task/UpdateVideoTask'
import Tweeter from '../lib/util/Tweeter'
import { CliLog, Log } from '../logger/Logger'
import Video from '../model/Video'


export default async function (cli: CAC) {

  cli
  .command('test:json <dir>', 'Test push handler from json file (pushbullet)')
  .option('-t, --tweet', 'Output tweet')
  .action(async (dir, options) => {
    CliLog.info('[Command] Test push handler from json file')

    // テストなのでログは cli のみ
    if (!options.tweet) {
      config.mode.disableTweet = true
    }

    // ファイル読み込み
    Log.info(`Load: '${dir}'`)
    const json = await fs.readFile(dir, 'utf-8')
    const push = JSON.parse(json)

    // プッシュ処理
    const handler = new PushHandler(Log, true)
    await handler.invoke(push)
  })

cli
  .command('test:video <videoId>', 'Test video tweet by id')
  .option('-u, --update', 'Test update task (priority)')
  .option('-m, --member', 'Test member only')
  .option('-t, --tweet', 'Output tweet')
  .option('--ignore-schedule', 'Ignore schedule tweet')
  .action(async (videoId, options) => {
    CliLog.info('[Command] Test video tweet by id')

    // テストなのでログは cli のみ
    if (!options.tweet) {
      config.mode.disableTweet = true
    }

    // update なら update task の実験
    if (options.update) {
      // 今あるのを消す
      const update = await Video.delete({ videoId: videoId })
      if (update) {
        CliLog.info(`[Command] > [${videoId}]: delete`)
      }

      const task = new UpdateVideoTask(Log, YoutubeAPI)
      await task.updateById(videoId)
      return
    }

    ///

    // video を検索
    let video = await Video.findOne({ videoId: videoId })
    if (!video) {
      const api = await YoutubeAPI.fetchVideoList([videoId])
      video = new Video()
      video.assignAPI(api[videoId])
    }

    if (options.member) {
      video.isMemberOnly = true
    }

    // 通知を行う
    if (!options.ignoreSchedule) {
      const scheTwi = await Tweeter.builder().scheduleStreaming(video)
      video.scheduleTweetId = scheTwi.id_str
    }

    const startTwi = await Tweeter.builder().startLiveStreaming(video)
    video.startTweetId = startTwi.id_str

    const endTwi = await Tweeter.builder().endLiveStreaming(video)
    video.endTweetId = endTwi.id_str
  })
}
