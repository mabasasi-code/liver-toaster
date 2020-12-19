import TwitterAPI from 'twitter-lite'
import DirectMessageInterface from '../../interface/twitter/DirectMessageInterface'
import TweetInterface from '../../interface/twitter/TweetInterface'
import TwitterUserInterface from '../../interface/twitter/TwitterUserInterface'

export default class Twitter {
  private client: TwitterAPI

  private clientUser: TwitterUserInterface

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

  public async getClientUser(cache: boolean = true) {
    // https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials
    // Requests / 15-min window (user auth)	75

    if (!cache || !this.clientUser) {
      this.clientUser = await this.client.get<TwitterUserInterface>('account/verify_credentials')
    }

    const user = this.clientUser
    return user
  }

  public async postTweet(text: string, inReplyTweetId?: string) {
    // https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/post-statuses-update
    // Requests / 3-hour window	300* per user; 300* per app (RT と共用)

    const params: object = { status: text }
    if (inReplyTweetId) {
      params['in_reply_to_status_id'] = inReplyTweetId
      params['auto_populate_reply_metadata'] = true
    }

    const tweet = await this.client.post<TweetInterface>('statuses/update', params)
    return tweet
  }

  public async postDirectMessageToOwn(text: string) {
    // https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/sending-and-receiving/api-reference/new-event
    // Requests / 24-hour window	1000 per user; 15000 per app

    const user = await this.getClientUser()

    const params: object = {
      event: {
        type: 'message_create',
        message_create: {
          target: {
            recipient_id: user.id_str,
          },
          message_data: {
            text: text
          }
        }
      }
    }

    const dm = await this.client.post<DirectMessageInterface>('direct_messages/events/new', params)
    return dm
  }
}
