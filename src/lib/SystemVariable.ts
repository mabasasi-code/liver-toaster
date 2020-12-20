import { EntityManager, getConnection, getManager, QueryRunner } from 'typeorm'
import System from '../model/System'
import DatabaseQueue from './DatabaseQueue'

export interface SystemInterface {
  lastUpdate?: Date
  errorLog?: string
}

export default class SystemVariable {
  public static async read(key?: keyof SystemInterface) {
    if (key) {
      // key があるなら単一 value を返却する
      const record = await System.findOne({ key: key })
      return record ? record.getValue() : undefined
    } else {
      // key が無いなら全 value から object を構築する
      const records = await System.find({})

      const item: SystemInterface = {}
      for (const record of records) {
        item[record.key] = record.getValue()
      }
      return item
    }
  }

  public static async write(key: keyof SystemInterface, value: any) {
    const res = await DatabaseQueue.transaction(async (tm: EntityManager) => {
      const record = await tm.findOne(System, { key: key }) || new System()
      record.key = key
      record.setValue(value)
      return await tm.save(record)
    })

    return res
  }

  public static async append(key: keyof SystemInterface, text: string, joinChar: string = '\n') {
    const res = await DatabaseQueue.transaction(async (tm: EntityManager) => {
      const record = await tm.findOne(System, { key: key }) || new System()
      const value = record.value ? (record.value + joinChar + text) : text

      record.key = key
      record.setValue(value)
      return await tm.save(record)
    })

    return res
  }

  public static async reset(key: keyof SystemInterface) {
    const res = await DatabaseQueue.transaction(async (tm: EntityManager) => {
      const records = await tm.find(System, { key: key }) || []
      if (records) {
        for (const record of records) {
          await tm.remove(record)
        }
      }
    })
  }
}
