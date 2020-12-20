import log4js from 'log4js'

const originLayout = require('./originLayout.js').default
const writeErrorAdapter = require('./writeErrorAdapter.js')

const LOG_LEVEL = process.env.LOG_LEVEL || 'ALL' // DEBUG: TRACE or DEBUG, PRODUCTION: INFO or OFF
const COMMON_FILENAME = process.env.NODE_ENV || 'develop'

const MEGABYTE = 1024 * 1024

log4js.addLayout('origin', originLayout)

log4js.configure({
  appenders: {
    out: {
      type: 'stdout',
      layout: { type: 'origin', addColor: true }
    },
    logFile: {
      type: 'file',
      filename: `storage/logs/${COMMON_FILENAME}.log`,
      pattern: 'yyyy-MM-dd',
      alwaysIncludePattern: true,
      daysToKeep: 5,
      backups: 1,
      keepFileExt: true,
      layout: { type: 'origin' },
    },
    errFile: {
      type: 'file',
      filename: 'storage/logs/error.log',
      maxLogSize: MEGABYTE,
      backups: 1,
      keepFileExt: true,
      layout: { type: 'origin' },
    },
    recordFile: {
      type: 'file',
      filename: 'storage/logs/record.log',
      maxLogSize: MEGABYTE,
      backups: 1,
      keepFileExt: true,
      layout: { type: 'origin' },
    },
    writeDB: {
      type: writeErrorAdapter,
      layout: { type: 'origin', disableCallstack: true },
    },

    logFilter: { type: 'logLevelFilter', appender: 'logFile', level: 'all' },
    errFilter: { type: 'logLevelFilter', appender: 'errFile', level: 'warn' },
    stackFilter: { type: 'logLevelFilter', appender: 'writeDB', level: 'warn' },
  },

  categories: {
    default: { appenders: ['out'], level: LOG_LEVEL, enableCallStack: true },

    cli: { appenders: ['out', 'logFilter', 'errFilter', 'stackFilter'], level: 'all', enableCallStack: true },
    notify: { appenders: ['out', 'logFilter', 'errFilter', 'stackFilter'], level: 'all', enableCallStack: true },
    cron: { appenders: ['out', 'logFilter', 'errFilter', 'stackFilter'], level: 'all', enableCallStack: true },
    event: { appenders: ['out', 'logFilter', 'errFilter', 'stackFilter'], level: 'all', enableCallStack: true },

    record: { appenders: ['recordFile'], level: 'ALL', enableCallStack: true },
  }
})

export default log4js
export const Log = log4js.getLogger() // 記録されないログ

export const CliLog = log4js.getLogger('cli') // コマンド系
export const NotifyLog =log4js.getLogger('notify') // 通知からの処理
export const CronLog = log4js.getLogger('cron') // cron からの処理
export const EventLog = log4js.getLogger('event') // イベント系

export const RecordLog = log4js.getLogger('record') // dump 用
