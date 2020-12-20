import delay from 'delay'
import { EntityManager, getConnection, QueryRunner } from 'typeorm'

type TransactionFunc = (manager: EntityManager, queryRunner: QueryRunner) => any | void

interface TransactionItem {
  key: number
  func: TransactionFunc
}

export default class DatabaseQueue {
  public static WATCH_INTERVAL: number = 100
  public static MAX_TRY: number = 100

  protected static queryRunner: QueryRunner
  protected static queue: TransactionItem[] = []

  public static async transaction(func: TransactionFunc) {
    const key = new Date().getTime()
    const record = { key, func }

    // 待機 queue に突っ込む
    DatabaseQueue.queue.push(record)

    const res = await DatabaseQueue.transactionControl(record)
    return res
  }

  public static getQueueLength() {
    return DatabaseQueue.queue.length
  }

  ///

  protected static getQueryRunner() {
    if (!DatabaseQueue.queryRunner) {
      const connection = getConnection()
      const runner = connection.createQueryRunner()
      DatabaseQueue.queryRunner = runner
    }

    return DatabaseQueue.queryRunner
  }

  protected static getQueueIndex(record: TransactionItem) {
    const index = DatabaseQueue.queue.findIndex(e => e.key === record.key)
    return index
  }

  protected static async transactionControl(record: TransactionItem) {
    const runner = DatabaseQueue.getQueryRunner()

    let i = 0
    while (i < this.MAX_TRY) {
      const index = DatabaseQueue.getQueueIndex(record)

      // runner が止まってて、 queue の先頭なら実行
      if (!runner.isReleased && !runner.isTransactionActive && index === 0) {
        const res = await DatabaseQueue.transactionImpl(runner, record.func)
        DatabaseQueue.queue.shift() // queue から削除
        return res
      }

      // もし queue に存在しなかったらエラー
      if (index < 0) {
        throw new ReferenceError('Transaction not found in queue')
      }

      // 待機
      await delay(DatabaseQueue.WATCH_INTERVAL)
      i++
    }

    throw new Error('Database queue max tried')
  }

  protected static async transactionImpl(runner: QueryRunner, func: TransactionFunc) {
    try {
      await runner.connect()
      await runner.startTransaction()

      const res = await func(runner.manager, runner)
      await runner.commitTransaction()

      return res
    } catch (err) {
      await runner.rollbackTransaction()
      throw err // rethrow
    } finally {
      await runner.release()
    }
  }
}
