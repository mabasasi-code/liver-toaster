import { get } from "dot-prop";
import VideoInterface from "../interface/database/VideoInterface";
import YoutubeVideoInterface from "../interface/youtube/VideoInterface";
import BaseStore from "./BaseStore";

export default class Video extends BaseStore<VideoInterface> {
  constructor() {
    super('videos.db')
  }

  // @override
  public async upsert(value: VideoInterface): Promise<VideoInterface | null> {
    const videoId = value.videoId
    return super.upsert({ videoId: videoId }, value)
  }

  public async findIncomplete() {
    return await this.find({ notifyEnd: false, deletedAt: null })
  }

  public attachAPIValue(db?: VideoInterface, api?: YoutubeVideoInterface): VideoInterface {
    const base: VideoInterface = {
      videoId: get(api, 'id'),
      title: get(api, 'snippet.title'),
      channelId: get(api, 'snippet.channelId'),
      channelTitle: get(api, 'snippet.channelTitle'),
      scheduledStartTime: get(api, 'liveStreamingDetails.scheduledStartTime'),
      actualStartTime: get(api, 'liveStreamingDetails.actualStartTime'),
      actualEndTime: get(api, 'liveStreamingDetails.actualEndTime'),

      thumbnailUrl: get(api, 'snippet.thumbnails.maxers.url')
        || get(api, 'snippet.thumbnails.standard.url')
        || get(api, 'snippet.thumbnails.high.url')
        || get(api, 'snippet.thumbnails.medium.url')
        || get(api, 'snippet.thumbnails.default.url'),

      notifyStart: get(db, 'notifyStart') || false,
      notifySchedule: get(db, 'notifySchedule') || false,
      notifyEnd: get(db, 'notifyEnd') || false,
    }
    return base
  }
}
