import CommunityDomInterface from "../../interface/youtube/CommunityDomInterface"

export default class Checker {
  public static isMemberPost(post: CommunityDomInterface) {
    return Boolean(post.sponsorsOnlyBadge)
  }

  public static getPostType(post: CommunityDomInterface): 'video' | 'image' | 'text' {
    const backStage = post.backstageAttachment
    if (backStage) {
      if (backStage.videoRenderer) {
        return 'video'
      } else if (backStage.backstageImageRenderer) {
        return 'image'
      }
    }
    return 'text'
  }
}
