import { Logger } from 'log4js'
import dateformat from 'dateformat'
import diffDates from 'diff-dates'
import { TwitterAPI } from '../../../bootstrap'
import SystemVariable, { SystemInterface } from '../../SystemVariable'
import Loggable from '../../util/Loggable'
import { EventLog } from '../../../logger/Logger'
import Channel from '../../../model/Channel'
import config from '../../../config/config'

export default class PostLoggingDM extends Loggable {

  constructor (logger: Logger) {
    super(logger)
  }

  public async startLog() {
    const date = new Date()
    this.logger.debug(`Post logging DM (run program)`)

    try {
      // DM 組み立て
      const lines = [dateformat(date, 'yyyy-mm-dd HH:MM:ss')]
      lines.push('プログラムが起動しました。')
      lines.push('環境:' + config.env)

      const chLen = await Channel.count({})
      lines.push('対象チャンネル数:' + chLen)

      // 送信
      const dm = await TwitterAPI.postDirectMessageToOwn(lines.join('\n'))

      // tweeter と揃える
      const sender = dm.event.message_create.sender_id || null
      const reply = sender ? ` => ${sender}` : ''
      EventLog.info(`> dm${reply}\n${dm.event.message_create.message_data.text} [EOL]`)
    } catch (err) {
      this.logger.error(err)
    }
  }

  public async hourLog() {
    const date = new Date()
    this.logger.debug(`Post logging DM (${dateformat(date, 'mm/dd HH') + '時のログレポート'})`)

    try {
      // エラーログを取得
      const system = await SystemVariable.read() as SystemInterface

      // DM 組み立て
      const lines = [dateformat(date, 'yyyy-mm-dd HH:MM:ss')]
      lines.push(dateformat(date, 'mm/dd HH') + '時のログレポート')

      lines.push('')

      const chLen = await Channel.count({})
      lines.push('対象チャンネル数:' + chLen)

      const last = system.lastUpdate ? dateformat(system.lastUpdate, 'yyyy-mm-dd HH:MM:ss') : '実行されていません'
      const diff = system.lastUpdate ? diffDates(date, system.lastUpdate, 'minutes') : '--'
      lines.push(`最終タスク実行日時: ${last} (${diff} 分前)`)

      if (system.errorLog) {
        lines.push(system.errorLog)
      } else {
        lines.push('エラーはありません。')
      }

      // 送信
      const dm = await TwitterAPI.postDirectMessageToOwn(lines.join('\n'))


      // tweeter と揃える
      const sender = dm.event.message_create.sender_id || null
      const reply = sender ? ` => ${sender}` : ''
      EventLog.info(`> dm${reply}\n${dm.event.message_create.message_data.text} [EOL]`)

      // ログを消し去る
      await SystemVariable.reset('errorLog')
    } catch (err) {
      this.logger.error(err)
    }
  }
}
