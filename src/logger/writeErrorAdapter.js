// ref: https://github.com/log4js-node/log4js-node/blob/master/docs/writing-appenders.md

const System = require('../model/System').default

function dboutAppender(layout, timezoneOffset) {
  return async (loggingEvent) => {
    const logStr = layout(loggingEvent, timezoneOffset)
    await System.append('errorLog', logStr)
  }
}

function configure(config, layouts) {
  let layout = layouts.colouredLayout
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout)
  }

  return dboutAppender(layout, config.timezoneOffset)
}

exports.configure = configure
