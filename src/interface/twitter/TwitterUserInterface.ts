import TwitterEntityInterface from "./TwitterEntityInterface";

export default interface TwitterUserInterface {
  created_at: string // 'Tue Dec 31 09:36:07 +0000 2019'

  // id: number // do not use!
  id_str: string
  name: string
  screen_name: string
  location?: string
  description?: string
  url?: string
  entities?: { description: TwitterEntityInterface }

  followers_count: number
  friends_count: number
  listed_count: number
  favourites_count: number
  statuses_count: number

  profile_background_image_url_https?: string
  profile_image_url_https?: string

  protected: boolean
  verified: boolean
  following: boolean
  follow_request_sent: boolean
  notifications: boolean
}
