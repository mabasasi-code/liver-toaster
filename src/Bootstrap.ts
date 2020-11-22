
import config from "./config/Index"
import Twitter from "./lib/api/Twitter";
import Youtube from "./lib/api/Youtube";
import Pushbullet from "./lib/pushbullet/Pushbullet";
import Video from "./lib/store/Video";

// TODO: 仮実装

export const PushbulletInstance = new Pushbullet(
  config.pushbullet.accessToken,
  config.pushbullet.encryptionKey
)

export const TwitterAPI = new Twitter(
  config.twitter.consumerKey,
  config.twitter.consumerSecret,
  config.twitter.accessToken,
  config.twitter.accessTokenSecret,
  config.mode.ignoreTweet,
)

export const YoutubeAPI = new Youtube(config.youtube.apiKey)

export const VideoStore = new Video()

export default async () => {}
