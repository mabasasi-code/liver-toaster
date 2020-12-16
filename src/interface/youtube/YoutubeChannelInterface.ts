import { YoutubeThumbnailInterface } from './YoutubeThumbnailInterface';

export default interface YoutubeChannelInterface {
  id: string
  snippet: {
    publishedAt: string // 2020-11-19T09:19:07Z
    title: string
    description: string
    thumbnails: {
      default: YoutubeThumbnailInterface
      medium: YoutubeThumbnailInterface
      high: YoutubeThumbnailInterface
    }
  }
  contentDetails: {
    relatedPlaylists: {
      likes: string
      favorites: string
      uploads: string // UUxxxx
    }
  }
  statistics: {
    viewCount: number,
    subscriberCount: number,
    videoCount: number
    hiddenSubscriberCount: boolean,
  },
  brandingSettings: {
    // なんか banner 取れなくなってる…？
    image: {
      bannerExternalUrl: string
    }
  }
}
