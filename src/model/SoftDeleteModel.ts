import { Column } from "typeorm";
import BaseModel from "./BaseModel";

export default class SoftDeleteModel extends BaseModel {
  @Column('datetime', { nullable: true })
  readonly deletedAt: Date

  public isDelete() {
    return this.deletedAt !== null
  }

  public setDeleteFlag() {
    // deletedAt が無いなら実行
    if (!this.deletedAt) {
      Object.assign(this, { deletedAt: new Date() })
    }
  }

  public removeDeleteFlag() {
    // deletedAt があるなら実行
    if (this.deletedAt) {
      Object.assign(this, { deletedAt: null })
    }
  }
}
