import nedb from 'nedb-promises'
import youtube from './api/youtube'

// https://github.com/bajankristof/nedb-promises
const Video = nedb.create({
  filename: './database/videos.db',
  timestampData: true,
  autoload: true,
})

/// //////////
// common

// db から video を取り出す
const findVideo = async function (videoId) {
  const video = await Video.findOne({ videoId: videoId })
  return video
}

// db の video を更新する
const upsertVideo = async function (video) {
  const res = await Video.update(
    { videoId: video.videoId },
    { $set: video },
    { upsert: true, returnUpdatedDocs: true }
  )
  return res
}

/// //////////
// util

// db から video を取り出して api の値で更新する
const findVideoAndUpdate = async function (videoId) {
  // api を叩く
  const apiVideo = await youtube.fetchVideo(videoId)
  if (apiVideo === null) {
    // api の取得に失敗したら終了
    return null
  }

  // db に video があるなら attach して返す
  const dbVideo = await findVideo(videoId)
  if (dbVideo) {
    const video = youtube.attachValue(dbVideo, apiVideo)
    return video
  }

  // それ以外は api の値を返す
  return apiVideo
}

///

export default {
  findVideo,
  upsertVideo,
  findVideoAndUpdate,
}
