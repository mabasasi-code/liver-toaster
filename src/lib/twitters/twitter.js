import Twitter from 'twitter-lite'
import config from '../../config/index'

// https://github.com/draftbit/twitter-lite
const client = new Twitter({
  consumer_key: config.twitter.consumerKey,
  consumer_secret: config.twitter.consumerSecret,
  access_token_key: config.twitter.accessToken,
  access_token_secret: config.twitter.accessTokenSecret,
});

// 接続している user を取得
const getClientUser = async function () {
  const user = await client.get('account/verify_credentials')
  return user
}

// twitter で呟く
const postTweet = async function (text) {
  // dump モードならスタブを作成
  if (config.tweet) {
    return { id: 'stub', id_str: 'stub', text: text }
  }

  const tweet = await client.post('statuses/update', {
    status: text,
  });
  return tweet
}

export default {
  getClientUser,
  postTweet,
}
