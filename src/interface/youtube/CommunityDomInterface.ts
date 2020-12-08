import { YoutubeThumbnailInterface } from "./YoutubeThumbnailInterface";

export default interface CommunityDomInterface {
  postId: string
  authorText: {
    simpleText: string
  }
  authorThumbnail: {
    thumbnails: YoutubeThumbnailInterface[] // size: 32, 48, 76 があった
  }
  contentText: {
    runs: {
      text: string
    }[] // 改行ごとに 別れている？
  }
  backstageAttachment?: { // これが無ければテキストのみ
    backstageImageRenderer?: { // 画像 post
      image: {
        thumbnails: YoutubeThumbnailInterface[] // size: 288, 400, ..., 1200 があった
      }
    }
    videoRenderer?: { // 動画 post
      videoId: string
      thumbnail: {
        thumbnails: YoutubeThumbnailInterface[] // size: 168, 196, 246, 336 があった
      }
      title: {
        simpleText: string
      }
      descriptionSnippet: {
        simpleText: string
      }
    }
  }
  sponsorsOnlyBadge?: { // これが有ると member only
    sponsorsOnlyBadgeRenderer: {
      tooltip: {
        runs: {
          text: string // 1 にメンバー名が入ってる
        }[]
      }
    }
  }
}
