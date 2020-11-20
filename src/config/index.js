
const env = process.env.NODE_ENV
const isProduction = (env === 'production')

export default {
  env: process.env.NODE_ENV,
  dumpMode: (process.env.DUMP_MODE === 'true'),
  listenMode: (process.env.LISTEN_MODE === 'true'),
  pushbullet: {
    accessToken: process.env.PUSHBULLET_ACCESS_TOKEN,
    encryptionKey: process.env.PUSHBULLET_ENCRYPTION_KEY,
    deviceIden: process.env.PUSHBULLET_DEVCE_IDEN,
  },
  twitter: {
    callbackUrl: process.env.TWITTER_CALLBACK_URL,
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: (isProduction)
      ? process.env.TWITTER_ACCESS_TOKEN
      : (process.env.TWITTER_ACCESS_TOKEN_DEV || process.env.TWITTER_ACCESS_TOKEN),
    accessTokenSecret: (isProduction)
      ? process.env.TWITTER_ACCESS_TOKEN
      : (process.env.TWITTER_ACCESS_TOKEN_SECRET_DEV || process.env.TWITTER_ACCESS_TOKEN),
  },
  youtube: {
    channelName: process.env.YOUTUBE_CHANNEL_NAME,
  }
}
