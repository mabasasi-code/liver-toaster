import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import BaseModel from './BaseModel'

export interface SystemInterface {
  lastUpdate?: Date
  errorLog?: string
}

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

  ///

  public static async read(key?: keyof SystemInterface) {
    if (key) {
      const record = await System.findOne({ key: key })
      return record.date || record.value
    } else {
      const records = await System.find({})

      const item: SystemInterface = {}
      for (const record of records) {
        item[record.key] = record.date || record.value
      }
      return item
    }
  }

  public static async write(key: keyof SystemInterface, value: any) {
    const record = await System.findOne({ key: key }) || new System()
    record.key = key
    if (value instanceof Date) {
      record.date = value
    } else {
      record.value = value
    }
    return await record.save()
  }

  public static async append(key: keyof SystemInterface, value: string, joinChar: string = '\n') {
    const record = await System.findOne({ key: key }) || new System()
    record.key = key
    record.value = record.value + joinChar + value
    return await record.save()
  }
}
