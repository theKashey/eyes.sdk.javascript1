const utils = require('@applitools/utils')
const chalk = require('chalk')
const {inspect} = require('util')

function format(chunks, {prelude = true, label, timestamp = new Date(), level = 'info', tags, colors} = {}) {
  const message = []
  if (prelude) {
    if (label) {
      const text = label.padEnd(10)
      const color = colors && colors.label
      message.push(color ? colorize(text, {color}) : `${text}|`)
    }
    if (timestamp) {
      const text = new Date(timestamp).toISOString()
      const color = colors && colors.timestamp
      message.push(color ? colorize(text, {color}) : text)
    }
    if (level) {
      const text = level.toUpperCase().padEnd(5)
      const color = colors && colors.level && colors.level[level]
      message.push(color ? colorize(` ${text} `, {color}) : `[${text}]`)
    }
    if (!utils.types.isEmpty(tags)) {
      const text = JSON.stringify(tags)
      const color = colors && colors.tags
      message.push(color ? colorize(text, {color}) : text)
    }
  }

  if (chunks && chunks.length > 0) {
    const color = colors && colors.message
    const strings = chunks.map(chunk => {
      return utils.types.isString(chunk)
        ? colorize(chunk, {color})
        : inspect(chunk, {colors: Boolean(colors), compact: 5})
    })
    message.push(strings.join(' '))
  }

  return message.join(' ')
}

function colorize(string, {color} = {}) {
  if (!color) return string
  if (!utils.types.isArray(color)) color = [color]
  return color.reduce((chalk, color) => chalk[color] || chalk, chalk)(string)
}

module.exports = format
