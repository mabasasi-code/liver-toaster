import PushInterface from "../../../interface/pushbullet/PushInterface";

export default abstract class BasePushHandler {
  public abstract isValid(push: PushInterface): boolean
  public abstract handle(push: PushInterface): Promise<void>
}
