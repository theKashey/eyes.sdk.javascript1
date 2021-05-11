const chalk = require('chalk')
const utils = require('@applitools/utils')

function format(message, {formatting = true, label, timestamp = new Date(), level = 'info', tags, color, colors} = {}) {
  const parts = []
  if (formatting) {
    if (label) {
      const text = label.padEnd(10)
      const color = colors && colors.label
      parts.push(color ? colorize(text, {color}) : `${text}|`)
    }
    if (timestamp) {
      const text = new Date(timestamp).toISOString()
      const color = colors && colors.timestamp
      parts.push(color ? colorize(text, {color}) : text)
    }
    if (level) {
      const text = level.toUpperCase().padEnd(5)
      const color = colors && colors.level && colors.level[level]
      parts.push(color ? colorize(` ${text} `, {color}) : `[${text}]`)
    }
    if (!utils.types.isEmpty(tags)) {
      const text = JSON.stringify(tags)
      const color = colors && colors.tags
      parts.push(color ? colorize(text, {color}) : text)
    }
  }
  if (message !== undefined) {
    const text = utils.types.isString(message) ? message : JSON.stringify(message)
    const color = colors && colors.message
    parts.push(color ? colorize(text, {color}) : text)
  }

  const text = parts.join(' ')
  return color ? colorize(text, {color}) : text
}

function colorize(message, {color} = {}) {
  if (!color) return message
  if (!utils.types.isArray(color)) color = [color]
  return color.reduce((chalk, color) => chalk[color] || chalk, chalk)(message)
}

module.exports = format
