import os from 'os'
import log4js from 'log4js'
import dateformat from 'dateformat'
import chalk from 'chalk'

const LOG_LEVEL = process.env.LOG_LEVEL || 'ALL' // DEBUG: TRACE or DEBUG, PRODUCTION: INFO or OFF
const COMMON_FILENAME = process.env.NODE_ENV || 'develop'

const MEGABYTE = 1024 * 1024

const levelColors = {
  TRACE: { meta: 'grey', body: 'grey', trace: null },
  DEBUG: { meta: 'green', body: 'grey', trace: null },
  INFO: { meta: 'cyan', body: 'white', trace: null },
  WARN: { meta: 'yellow', body: 'yellow', trace: null },
  ERROR: { meta: 'red', body: 'red', trace: 'white' },
  FATAL: { meta: 'magenta', body: 'magenta', trace: 'white' }
}

const coloring = function (color: string, text: string) {
  if (color) {
    return chalk[color](text)
  }
  return text
}

log4js.addLayout('origin', function({ addColor }) {
  return function (e: log4js.LoggingEvent) {
    const date = new Date(e.startTime)
    const level = e.level.levelStr.toUpperCase() // 大文字
    const hasCallStack = e.hasOwnProperty('callStack') // callStack を持っているか

    const dateStr = dateformat(date, 'yyyy-MM-dd HH:MM:ss.l')
    const message = e.data.join(' ') // データはスペース区切り
    const levelStr = level.padEnd(5).slice(0, 5) // 5文字
    const color = levelColors[level]

    // メタ情報
    const meta = `${levelStr} ${dateStr} [${e.categoryName}]`
    const prefix = addColor ? coloring(color.meta, meta) : meta

    // ログ本体
    const body = addColor ? coloring(color.body, message) : message

    // スタックトレース
    let suffix = ''
    if (hasCallStack && color.trace) {
      // @ts-ignore
      const callStack = e.callStack
      suffix += os.EOL
      suffix += addColor ? coloring(color.trace, callStack) : callStack
    }

    return `${prefix} ${body}${suffix}`
  }
})

log4js.configure({
  appenders: {
    out: { type: 'stdout', layout: { type: 'origin', addColor: true } },
    logFile: {
      type: 'file',
      filename: `storage/logs/${COMMON_FILENAME}.log`,
      pattern: 'yyyy-MM-dd',
      alwaysIncludePattern: true,
      daysToKeep: 5,
      backups: 1,
      keepFileExt: true,
      layout: { type: 'origin', addColor: false },
    },
    errFile: {
      type: 'file',
      filename: 'storage/logs/error.log',
      maxLogSize: MEGABYTE,
      backups: 1,
      keepFileExt: true,
      layout: { type: 'origin', addColor: false },
    },
    recordFile: {
      type: 'file',
      filename: 'storage/logs/record.log',
      maxLogSize: MEGABYTE,
      backups: 1,
      keepFileExt: true,
      layout: { type: 'origin', addColor: false },
    },
    log: { type: 'logLevelFilter', appender: 'logFile', level: LOG_LEVEL }, // レベルを default と揃える
    err: { type: 'logLevelFilter', appender: 'errFile', level: 'warn' },
  },
  categories: {
    default: { appenders: ['out'], level: LOG_LEVEL, enableCallStack: true },

    notify: { appenders: ['out', 'log', 'err'], level: LOG_LEVEL, enableCallStack: true },
    cron: { appenders: ['out', 'log', 'err'], level: LOG_LEVEL, enableCallStack: true },
    event: { appenders: ['out', 'log', 'err'], level: LOG_LEVEL, enableCallStack: true },
    record: { appenders: ['recordFile'], level: 'ALL', enableCallStack: true },
  }
})

export default log4js
export const Log = log4js.getLogger()

export const NotifyLog =log4js.getLogger('notify') // 通知からの処理
export const CronLog = log4js.getLogger('cron') // cron からの処理
export const EventLog = log4js.getLogger('event') // イベント系

export const RecordLog = log4js.getLogger('record') // dump 用
