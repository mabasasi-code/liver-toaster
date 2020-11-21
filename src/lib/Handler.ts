
export default abstract class Handler {
  public abstract isValid(value: any): boolean
  public abstract handle(value: any): Promise<void>
}
