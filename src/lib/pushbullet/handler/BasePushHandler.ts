import Handler from "../../Handler";
import PushInterface from "../../../interface/pushbullet/PushInterface";

export default abstract class BasePushHandler extends Handler {
  public abstract isValid(push: PushInterface): boolean
  public abstract handle(push: PushInterface): Promise<void>
}
