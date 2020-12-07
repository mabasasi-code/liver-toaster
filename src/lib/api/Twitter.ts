import TwitterAPI from 'twitter-lite'
import TweetInterface from '../interface/twitter/TweetInterface'
import UserInterface from '../interface/twitter/UserInterface'

export default class Twitter {
  private client: TwitterAPI

  constructor (
    consumerKey: string,
    consumerSecret: string,
    accessToken: string,
    accessTokenSecret: string,
  ) {
    const client = new TwitterAPI({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      access_token_key: accessToken,
      access_token_secret: accessTokenSecret,
    })
    this.client = client
  }

  public async getClientUser(): Promise<UserInterface | null> {
    const user = await this.client.get('account/verify_credentials')
    return user
  }

  public async postTweet(text: string, inReplyTweetId?: string): Promise<TweetInterface | null> {
    const params: object = { status: text }
    if (inReplyTweetId) {
      params['in_reply_to_status_id'] = inReplyTweetId
      params['auto_populate_reply_metadata'] = true
    }

    const tweet = await this.client.post('statuses/update', params);
    return tweet
  }
}
