import axios from 'axios'
import { get } from 'dot-prop'
import { HTMLElement, parse as HTMLParser } from 'node-html-parser'
import { CookieMap } from 'cookiefile'
import CommunityDomInterface from '../interface/youtube/CommunityDomInterface'

export default class ScrapeChannelCommunityTask {
  public async get(channelId: string, loadCookie: boolean = false) {
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
    const threads = this.searchThreads(doc)
    return threads
  }

  ///

  protected searchThreads(doc: HTMLElement): CommunityDomInterface[] {
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

          const tabs = get(json, 'contents.twoColumnBrowseResultsRenderer.tabs', [])
          const communityTab = tabs.find(e => {
            return get(e, 'tabRenderer.endpoint.commandMetadata.webCommandMetadata.url', '')
            .includes('community')
          })

          const threads = get(communityTab, 'tabRenderer.content.sectionListRenderer.contents.0.itemSectionRenderer.contents', [])
          const posts: CommunityDomInterface[] = threads.map(e => get(e, 'backstagePostThreadRenderer.post.backstagePostRenderer'))

          return posts
        }
      }
    }
    return []
  }
}
