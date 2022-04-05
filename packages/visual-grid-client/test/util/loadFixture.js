'use strict'
const fs = require('fs')
const path = require('path')

function loadJsonFixture(filename) {
  const json = require(`../fixtures/${filename}`)

  // must be a copy of the json fixture
  return JSON.parse(JSON.stringify(json))
}

function loadFixtureBuffer(filename, encoding) {
  return fs.readFileSync(path.resolve(__dirname, `../fixtures/${filename}`), {encoding})
}

function loadFixture(filename) {
  return loadFixtureBuffer(filename).toString()
}

module.exports = {
  loadFixture,
  loadFixtureBuffer,
  loadJsonFixture,
}
