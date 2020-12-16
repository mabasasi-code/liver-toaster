export default {
  env: process.env.NODE_ENV,
  databasePath: process.env.DATABSE_PATH || './storage/database',

  mode: {
    testNotify: (process.env.TEST_NOTIFY === 'true'), // true でテスト通知をONに
    dumpAllNotify: (process.env.DUMP_ALL_NOTIFY === 'true'), // true で全通知のログ出力
    handleAllVideo: (process.env.HANDLE_ALL_VIDEO === 'true'), // true で登録外のチャンネルの動画も処理する
    disableTweet: (process.env.DISABLE_TWEET === 'true'), // true で つぶやきを禁止(ログには出力)
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
    apiKey: process.env.YOUTUBE_API_KEY
  }
}
