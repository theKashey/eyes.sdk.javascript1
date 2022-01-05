const utils = require('@applitools/utils')
const makeConsoleHandler = require('./console-handler')
const makeFileHandler = require('./file-handler')
const makeRollingFileHandler = require('./rolling-file-handler')

const LEVELS = {
  silent: 0,
  fatal: 100,
  error: 200,
  warn: 300,
  info: 400,
  // debug: 500,
  // trace: 600,
  all: Number.MAX_VALUE,
}

const COLORS = {
  label: 'cyan',
  timestamp: 'greenBright',
  tags: 'blueBright',
  level: {
    info: ['bgBlueBright', 'black'],
    warn: ['bgYellowBright', 'black'],
    error: ['bgRedBright', 'white'],
    fatal: ['bgRed', 'white'],
  },
}

function makeLogger({
  handler,
  format = require('./format'),
  label,
  tags,
  timestamp,
  level = process.env.APPLITOOLS_LOG_LEVEL || (process.env.APPLITOOLS_SHOW_LOGS ? LEVELS.info : LEVELS.silent),
  colors = false,
  console = true,
  extended = false,
} = {}) {
  if (!utils.types.isNumber(level)) level = LEVELS[level] || 0
  if (colors === true) colors = COLORS

  if (!handler || handler.type === 'console') {
    handler = makeConsoleHandler(handler)
  } else if (handler.type === 'file') {
    handler = makeFileHandler(handler)
    colors = undefined
  } else if (handler.type === 'rolling file') {
    handler = makeRollingFileHandler(handler)
    colors = undefined
  } else if (!utils.types.isFunction(handler.log)) {
    throw new Error('Handler have to implement `log` method or use one of the built-in handler names under `type` prop')
  }

  const consoleHandler = console ? (utils.types.isObject(console) ? console : makeConsoleHandler()) : handler

  return {
    ...makeAPI({handler, format, label, tags, timestamp, level, colors}),
    console: makeAPI({handler: consoleHandler, format, prelude: false}),
    extend(options = {}) {
      return makeLogger({
        format,
        label,
        tags,
        timestamp,
        level,
        console: consoleHandler,
        ...options,
        colors: colors || options.colors ? {...colors, ...options.colors} : undefined,
        handler,
        extended: true,
      })
    },
    tag(name, value) {
      if (!tags) tags = {}
      tags[name] = value
    },
    open() {
      if (!extended && handler.open) handler.open()
    },
    close() {
      if (!extended && handler.close) handler.close()
    },
  }

  function makeAPI({handler, format, level, ...defaults}) {
    return {log, warn, error, fatal, verbose: log}

    function log(...messages) {
      if (level < LEVELS.info) return
      const options = {...defaults, level: 'info'}
      handler.log(format(messages, options))
    }
    function warn(...messages) {
      if (level < LEVELS.warn) return
      const options = {...defaults, level: 'warn'}
      if (handler.warn) handler.warn(format(messages, options))
      else handler.log(format(messages, options))
    }
    function error(...messages) {
      if (level < LEVELS.error) return
      const options = {...defaults, level: 'error'}
      if (handler.error) handler.error(format(messages, options))
      else handler.log(format(messages, options))
    }
    function fatal(...messages) {
      if (level < LEVELS.fatal) return
      const options = {...defaults, level: 'fatal'}
      if (handler.fatal) handler.fatal(format(messages, options))
      else if (handler.error) handler.error(format(messages, options))
      else handler.log(format(messages, options))
    }
  }
}

module.exports = makeLogger
