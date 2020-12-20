// ref: https://github.com/log4js-node/log4js-node/blob/master/docs/writing-appenders.md

const System = require('../lib/SystemVariable.ts').default

const dboutAppender = function (layout, timezoneOffset) {
  return async (loggingEvent) => {
    const logStr = layout(loggingEvent, timezoneOffset)
    await System.append('errorLog', logStr)
  }
}

const configure = function(config, layouts) {
  let layout = layouts.colouredLayout
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout)
  }

  return dboutAppender(layout, config.timezoneOffset)
}

exports.configure = configure
