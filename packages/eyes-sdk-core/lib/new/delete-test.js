const Logger = require('../logging/Logger')
const ServerConnector = require('../server/ServerConnector')
const Configuration = require('../config/Configuration')
const TestResults = require('../TestResults')

function makeDeleteTestResults() {
  return async function deleteTestResults({testId, batchId, secretToken, serverUrl, apiKey, proxy}) {
    const serverConnector = new ServerConnector({
      logger: new Logger(!!process.env.APPLITOOLS_SHOW_LOGS),
      configuration: new Configuration({serverUrl, apiKey, proxy}),
      getAgentId: () => '',
    })

    await serverConnector.deleteSession(new TestResults({id: testId, batchId, secretToken}))
  }
}

module.exports = makeDeleteTestResults
