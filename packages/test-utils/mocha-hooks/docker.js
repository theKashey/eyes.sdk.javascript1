const waitForDockerBrowsers = require('../src/wait-for-docker-browsers')
const checkForDockerHostname = require('../src/check-for-docker-hostname')

exports.mochaHooks = {
  async beforeAll() {
    await checkForDockerHostname()
    await waitForDockerBrowsers({
      remoteUrl: process.env.CVG_TESTS_REMOTE,
      retries: Number(process.env.CVG_TESTS_DOCKER_RETRY_COUNT) || 70,
    })
  },
}
