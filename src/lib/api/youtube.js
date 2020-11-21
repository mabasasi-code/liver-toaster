import { get } from 'dot-prop'
import { google } from 'googleapis'
import config from '../../config'

// https://github.com/googleapis/google-api-nodejs-client
const youtube = google.youtube({
  version: 'v3',
  auth: config.youtube.apiKey,
})

const mapping = function (rawVideo) {
  if (rawVideo) {
    const video = {
      videoId: get(rawVideo, 'id'),
      title: get(rawVideo, 'snippet.title'),
      channelId: get(rawVideo, 'snippet.channelId'),
      channelTitle: get(rawVideo, 'snippet.channelTitle'),
      scheduledStartTime: get(rawVideo, 'liveStreamingDetails.scheduledStartTime'),
      actualStartTime: get(rawVideo, 'liveStreamingDetails.actualStartTime'),
      actualEndTime: get(rawVideo, 'liveStreamingDetails.actualEndTime'),
      notifyStart: false, // 開始ツイート
      notifySchedule: false, // 予定ツイート
      notifyEnd: false, // 終了ツイート
    }
    return video
  }
  return null
}

const attachValue = function (base, update) {
  // 値を更新
  base.videoId = update.videoId
  base.title = update.title
  base.channelId = update.channelId
  base.channelTitle = update.channelTitle
  base.scheduledStartTime = update.scheduledStartTime
  base.actualStartTime = update.actualStartTime
  base.actualEndTime = update.actualEndTime
  return base
}

///

const fetchVideo = async function (videoId) {
  const res = await fetchVideoList([videoId])
  return get(res, '0')
}

const fetchVideoList = async function (videoIds) {
  const res = await youtube.videos.list({
    part: 'id, snippet, contentDetails, statistics, status, liveStreamingDetails',
    id: videoIds.join(','),
    maxResults: 50
  })
  return get(res, 'data.items', []).map(e => mapping(e))
}

///

export default {
  fetchVideo,
  fetchVideoList,
  attachValue,
}
