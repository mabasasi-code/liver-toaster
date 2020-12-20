import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import BaseModel from './BaseModel'

@Entity('systems')
export default class System extends BaseModel {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column('text')
  key: string

  @Column('text', { nullable: true })
  value: string

  @Column('datetime', { nullable: true })
  date: Date

  @CreateDateColumn()
  readonly createdAt: Date

  @UpdateDateColumn()
  readonly updatedAt: Date

  public setValue(value: any) {
    if (value instanceof Date) {
      this.date = value
      this.value = null
    } else {
      this.date = null
      this.value = value
    }
  }

  public getValue() {
    return this.date || this.value
  }
}
