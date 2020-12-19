import TwitterEntityInterface from './TwitterEntityInterface'
import TwitterUserInterface from './TwitterUserInterface'

// TODO: quote 対応
export default interface TweetInterface {
  created_at?: string // 'Sat Nov 21 23:23:47 +0000 2020'

  // id: string // do not use!
  id_str: string // 0 はダミー
  text: string
  entities?: TwitterEntityInterface
  source?: string // '<a href='https://twitter.com/shioxin_bot' rel='nofollow'>activity_bot</a>',
  in_reply_to_status_id?: string
  in_reply_to_status_id_str?: string
  in_reply_to_user_id?: string
  in_reply_to_user_id_str?: string
  in_reply_to_screen_name?: string
  user?: TwitterUserInterface
  retweet_count?: number
  favorite_count?: number
  favorited?: boolean
  retweeted?: boolean
}
