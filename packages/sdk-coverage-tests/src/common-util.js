const vm = require('vm')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const fetchSync = require('sync-fetch')

function findDifferencesBetweenCollections(hostCollection = [], guestCollection = []) {
  const _hostCollection = Array.isArray(hostCollection)
    ? hostCollection
    : Object.keys(hostCollection)
  const _guestCollection = Array.isArray(guestCollection)
    ? new Set(guestCollection)
    : new Set(Object.keys(guestCollection))
  return _hostCollection.filter(test => !_guestCollection.has(test))
}

function isUrl(value) {
  if (typeof value !== 'string') return false
  return /^https?:/.test(value)
}

function isString(value) {
  return typeof value === 'string'
}

function isFunction(value) {
  return typeof value === 'function'
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isEmptyObject(value) {
  return isObject(value) && Object.keys(value).length === 0
}

function mergeObjects(base, ...other) {
  return other.reduce((merged, other = {}) => {
    return Object.entries(other).reduce((merged, [key, value]) => {
      if (key in merged && isObject(value)) {
        merged[key] = mergeObjects(merged[key], value)
      } else {
        merged[key] = value
      }
      return merged
    }, merged)
  }, Object.assign({}, base))
}

function capitalize(string) {
  return string[0].toUpperCase() + string.substring(1)
}

function toPascalCase(string) {
  if (!string) return string
  return string
    .split(' ')
    .map(word => capitalize(word))
    .join('')
}

function loadFile(path) {
  return isUrl(path) ? fetchSync(path).text() : fs.readFileSync(path).toString()
}

function runCode(code, context) {
  try {
    return vm.runInContext(code, vm.createContext({...context, console, process}))
  } catch (err) {
    if (err.constructor.name !== 'ReferenceError') throw err
    const stack = err.stack.split('\n')
    const [columnNumber, lineNumber] = stack[5].split(':').reverse()
    console.log(chalk.yellow(`Error during running ${columnNumber}:${lineNumber}`), '\n')
    const [line, caret] = stack.slice(1, 3)
    console.log(chalk.cyan(line))
    console.log(chalk.yellow(caret))
    throw new ReferenceError(err.message)
  }
}

function requireUrl(url, cache = {}) {
  const code = loadFile(url)
  const module = {exports: {}}
  cache[url] = module
  runCode(code, {
    require(modulePath) {
      if (!/^[./]/.test(modulePath)) return require(modulePath)
      if (!path.extname(modulePath)) modulePath += '.js'
      let requiringUrl = new URL(modulePath, url).href
      return cache[requiringUrl] ? cache[requiringUrl].exports : requireUrl(requiringUrl, cache)
    },
    process,
    module,
  })
  return module.exports
}

module.exports = {
  findDifferencesBetweenCollections,
  mergeObjects,
  isUrl,
  isString,
  isFunction,
  isObject,
  isEmptyObject,
  capitalize,
  toPascalCase,
  loadFile,
  runCode,
  requireUrl,
}
