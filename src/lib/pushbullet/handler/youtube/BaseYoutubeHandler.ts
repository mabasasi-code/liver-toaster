import PushInterface from '../../../../interface/pushbullet/PushInterface'
import Channel from '../../../../model/Channel'
import BaseHandler from '../BaseHandler'

export default abstract class BaseYoutubeHandler extends BaseHandler {
  public abstract isValid(push: PushInterface, channel?: Channel): Promise<boolean>
  public abstract handle(push: PushInterface, channel?: Channel): Promise<void>
}
