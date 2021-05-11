'use strict'
const Events = require('events')
const {Eyes, ConsoleLogHandler, VisualGridRunner, Configuration} = require('../dist')

module.exports = class EyesOpen extends Events {
  async command(appName, testName, viewportSize) {
    const config = (this.client.options && this.client.options.eyes) || {}

    let eyes = this.client.api.globals.__eyes
    if (!eyes) {
      const runner = config.useVisualGrid ? new VisualGridRunner({testConcurrency: config.concurrency}) : undefined
      this.client.api.globals.__eyes = eyes = new Eyes(runner)
    }

    if (config.enableEyesLogs) {
      eyes.setLogHandler(new ConsoleLogHandler(true))
    }

    const configuration = new Configuration(config)
    eyes.setConfiguration(configuration)
    await eyes.open(this.client.api, appName, testName, viewportSize)
    this.emit('complete')
  }
}
