export default {
  env: process.env.NODE_ENV,
  mode: {
    testNotify: (process.env.TEST_NOTIFY === 'true'), // true でテスト通知をONに
    loggingNotify: (process.env.LOGGING_NOTIFY === 'true'), // true で全通知のログ出力
    ignoreTweet: (process.env.IGNORE_TWEET === 'true'), // true で 呟く代わりに出力する
  },
  pushbullet: {
    accessToken: process.env.PUSHBULLET_ACCESS_TOKEN,
    encryptionKey: process.env.PUSHBULLET_ENCRYPTION_KEY,
    deviceIden: process.env.PUSHBULLET_DEVCE_IDEN,
  },
  twitter: {
    callbackUrl: process.env.TWITTER_CALLBACK_URL,
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  },
  youtube: {
    channelName: process.env.YOUTUBE_CHANNEL_NAME, // nullable
  }
}
