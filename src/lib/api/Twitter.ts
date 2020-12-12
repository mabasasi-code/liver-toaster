import TwitterAPI from 'twitter-lite'
import TweetInterface from '../interface/twitter/TweetInterface'
import UserInterface from '../interface/twitter/UserInterface'

export default class Twitter {
  private client: TwitterAPI
  private stubMode: boolean

  constructor (
    consumerKey: string,
    consumerSecret: string,
    accessToken: string,
    accessTokenSecret: string,
    stubMode: boolean = false,
  ) {
    const client = new TwitterAPI({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      access_token_key: accessToken,
      access_token_secret: accessTokenSecret,
    })
    this.client = client
    this.stubMode = stubMode
  }

  public isStubMode() {
    return this.stubMode
  }

  public async getClientUser(): Promise<UserInterface | null> {
    const user = await this.client.get('account/verify_credentials')
    return user
  }

  public async postTweet(text: string, stubMode: boolean = false): Promise<TweetInterface | null> {
    // stub モードなら呟いたつもり
    if (this.stubMode || stubMode) {
      const tweet: TweetInterface = {
        created_at: new Date().toString(),
        id_str: '0000000000000000000',
        text: text,
        retweet_count: 0,
        favorite_count: 0,
        favorited: false,
        retweeted: false,
      }
      return tweet
    }

    const tweet = await this.client.post('statuses/update', {
      status: text,
    });
    return tweet
  }
}
