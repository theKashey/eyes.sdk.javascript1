const utils = require('@applitools/utils')
const makeConsoleHandler = require('./console-handler')
const makeFileHandler = require('./file-handler')

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
  level = LEVELS.silent,
  colors = false,
  console = true,
} = {}) {
  if (!utils.types.isNumber(level)) level = LEVELS[level] || 0

  if (!handler || handler.type === 'console') {
    if (colors === true) colors = COLORS
    handler = makeConsoleHandler(handler)
  } else if (handler.type === 'file') {
    colors = {}
    handler = makeFileHandler(handler)
  } else {
    if (colors === true) colors = COLORS
    else colors = {}
  }

  return {
    ...makeAPI({handler, format, label, tags, timestamp, level, colors}),
    console: makeAPI({handler: console ? makeConsoleHandler() : handler, format, formatting: false}),
    extend(label, color) {
      return makeLogger({handler, format, label, timestamp, level, colors: {...colors, label: color}})
    },
    open() {
      if (handler.open) handler.open()
    },
    close() {
      if (handler.close) handler.close()
    },
  }

  function makeAPI({handler, format, level, ...defaults}) {
    return {
      log(message, options = {}) {
        if (level < LEVELS.info) return
        const opts = {...defaults, ...options, tags: {...defaults.tags, ...options.tags}, level: 'info'}
        handler.log(format(message, opts))
      },
      warn(message, options = {}) {
        if (level < LEVELS.warn) return
        const opts = {...defaults, ...options, tags: {...defaults.tags, ...options.tags}, level: 'warn'}
        if (handler.warn) handler.warn(format(message, opts))
        else handler.log(format(message, opts))
      },
      error(message, options = {}) {
        if (level < LEVELS.error) return
        const opts = {...defaults, ...options, tags: {...defaults.tags, ...options.tags}, level: 'error'}
        if (handler.error) handler.error(format(message, opts))
        else handler.log(format(message, opts))
      },
      fatal(message, options = {}) {
        if (level < LEVELS.fatal) return
        const opts = {...defaults, ...options, tags: {...defaults.tags, ...options.tags}, level: 'fatal'}
        if (handler.fatal) handler.fatal(format(message, opts))
        else if (handler.error) handler.error(format(message, opts))
        else handler.log(format(message, opts))
      },
    }
  }
}

module.exports = makeLogger
