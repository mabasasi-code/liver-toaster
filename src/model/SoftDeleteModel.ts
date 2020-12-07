import { Column } from "typeorm";
import BaseModel from "./BaseModel";

export default class SoftDeleteModel extends BaseModel {
  @Column('datetime', { nullable: true })
  readonly deletedAt: Date

  public isDelete() {
    return this.deletedAt !== null
  }

  public setDeleteFlag() {
    if (this.deletedAt) {
      Object.assign(this, { deletedAt: new Date() })
    }
  }

  public removeDeleteFlag() {
    if (this.deletedAt !== null) {
      Object.assign(this, { deletedAt: null })
    }
  }
}
