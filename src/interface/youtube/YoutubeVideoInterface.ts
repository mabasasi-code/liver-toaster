import { YoutubeThumbnailInterface } from './YoutubeThumbnailInterface';

export default interface YoutubeVideoInterface {
  id: string
  snippet: {
    publishedAt: string // 2020-11-19T09:19:07Z
    channelId: string
    title: string
    description: string
    thumbnails: {
      default: YoutubeThumbnailInterface
      medium: YoutubeThumbnailInterface
      high: YoutubeThumbnailInterface
      standard?: YoutubeThumbnailInterface
      maxers?: YoutubeThumbnailInterface
    }
    channelTitle: string
    categoryId: number
    liveBroadcastContent: string
  }
  contentDetails: {
    duration: string // 'PT4H50M21S'
  }
  status: {
    privacyStatus: string
    madeForKids: boolean
  }
  statistics: {
    viewCount: number
    likeCount: number
    dislikeCount: number
    favoriteCount: number
    commentCount: number
  }
  liveStreamingDetails?: {
    scheduledStartTime?: string // '2020-11-19T04:00:12.181000Z'
    scheduledEndTime?: string
    actualStartTime?: string
    actualEndTime?: string
  }
}
