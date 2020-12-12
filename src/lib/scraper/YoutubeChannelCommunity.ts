import axios from 'axios'
import { get } from 'dot-prop'
import { HTMLElement, parse as HTMLParser } from 'node-html-parser'
import { CookieMap } from 'cookiefile'
import CommunityDomInterface from '../../interface/youtube/CommunityDomInterface'

export default class YoutubeCommunityScraper {
  public async getPostFirst(channelId: string, loadCookie: boolean = false) {
    const posts = await this.getPosts(channelId, loadCookie)
    return get<CommunityDomInterface>(posts, '0')
  }

  public async findPost(text: string, channelId: string, loadCookie: boolean = false) {
    const posts = await this.getPosts(channelId, loadCookie)
    for (const post of posts) {
      // post の text と一致するか
      const postHeadText = ((post.contentText.runs[0] || {}).text).trim()
      if (text.startsWith(postHeadText) || postHeadText.startsWith(text)) {
        return post
      }
    }
    return null
  }

  public async getPosts(channelId: string, loadCookie: boolean = false) {
    if (!channelId) throw new ReferenceError('No channel ID')

    const headers = {}
    if (loadCookie) {
      // 毎回生成する
      const cookie = new CookieMap('./cookie.txt')
      headers['Cookie'] = cookie.toRequestHeader()
    }

    const url = 'https://www.youtube.com/channel/' + channelId + '/community'
    const src = await axios.get(url, {
      responseType: 'document',
      headers: headers,
    })

    const doc = HTMLParser(src.data)
    const posts = this.searchPosts(doc)
    return posts
  }

  ///

  protected searchPosts(doc: HTMLElement): CommunityDomInterface[] {
    const json = this.searchInitialData(doc)
    if (!json) return []

    const tabs = get(json, 'contents.twoColumnBrowseResultsRenderer.tabs', [])
    const communityTab = tabs.find(e => {
      return get(e, 'tabRenderer.endpoint.commandMetadata.webCommandMetadata.url', '')
      .includes('community')
    })

    const threads = get(communityTab, 'tabRenderer.content.sectionListRenderer.contents.0.itemSectionRenderer.contents', [])
    const posts: CommunityDomInterface[] = threads.map(e => get(e, 'backstagePostThreadRenderer.post.backstagePostRenderer'))

    return posts
  }

  protected searchInitialData(doc: HTMLElement) {
    const scripts = doc.querySelectorAll('script')
    for (const script of scripts) {
      const text = script.text
      if (text.includes('window["ytInitialData"]')) {
        // {} の位置を探って json にする
        const st = text.indexOf('{')
        const ed = text.lastIndexOf('};')
        if (st && ed) {
          const rawJson = text.substring(st, ed + 1)
          const json = JSON.parse(rawJson)
          return json
        }
      }
    }
    return null
  }
}
