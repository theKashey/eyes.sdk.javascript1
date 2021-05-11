const Logger = require('../logging/Logger')
const ServerConnector = require('../server/ServerConnector')
const Configuration = require('../config/Configuration')
const TestResults = require('../TestResults')

function makeDeleteTestResults() {
  return async function deleteTestResults({results, serverUrl, apiKey, proxy}) {
    const serverConnector = new ServerConnector({
      logger: new Logger(!!process.env.APPLITOOLS_SHOW_LOGS),
      configuration: new Configuration({serverUrl, apiKey, proxy}),
      getAgentId: () => '',
    })

    await serverConnector.deleteSession(new TestResults(results))
  }
}

module.exports = makeDeleteTestResults
