import { get } from "dot-prop";
import { BaseEntity } from "typeorm";

export default class BaseModel extends BaseEntity {
  protected get(obj: { [key: string]: any }, path: string) {
    const value: string = get(obj, path)
    if (value) return value
    return null
  }

  protected getReqursion(obj: { [key: string]: any }, ...paths: string[]) {
    for (const path of paths) {
      const value = this.get(obj, path)
      if (value) return value
    }
    return null
  }

  protected getToDate(obj: { [key: string]: any }, prop: string) {
    const value: string = get(obj, prop)
    if (value) return new Date(value)
    return null
  }
}
