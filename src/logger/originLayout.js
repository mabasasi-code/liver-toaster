const os = require('os')
const dateformat = require('dateformat')
const chalk = require('chalk')

const levelColors = {
  TRACE: { meta: 'grey', body: 'grey', stack: null },
  DEBUG: { meta: 'green', body: 'grey', stack: null },
  INFO: { meta: 'cyan', body: 'white', stack: null },
  WARN: { meta: 'yellow', body: 'yellow', stack: null },
  ERROR: { meta: 'red', body: 'red', stack: 'white' },
  FATAL: { meta: 'magenta', body: 'magenta', stack: 'white' }
}

const coloring = function (color, text) {
  if (color) {
    return chalk[color](text)
  }
  return text
}

const originLayout = function ({ addColor = false, disableCallstack = false }) {
  return function (e) {
    const date = new Date(e.startTime)
    const level = e.level.levelStr.toUpperCase() // 大文字
    const hasCallStack = e.hasOwnProperty('callStack') // callStack を持っているか

    const dateStr = dateformat(date, 'yyyy-mm-dd HH:MM:ss.l')
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
    if (hasCallStack && color.stack && !disableCallstack) {
      const callStack = e.callStack
      suffix += os.EOL
      suffix += addColor ? coloring(color.stack, callStack) : callStack
    }

    return `${prefix} ${body}${suffix}`
  }
}

exports.default = originLayout
