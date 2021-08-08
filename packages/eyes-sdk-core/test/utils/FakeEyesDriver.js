const spec = require('./FakeSpecDriver')
const Logger = require('../../lib/logging/Logger')
const {Driver} = require('@applitools/driver')

function createFakeDriver(driver) {
  return new Driver({
    logger: new Logger(!!process.env.APPLITOOLS_SHOW_LOGS),
    spec,
    driver,
  })
}

module.exports = {createFakeDriver}
