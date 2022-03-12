const waitForDockerBrowsers = require('../src/wait-for-docker-browsers')
const checkForDockerHostname = require('../src/check-for-docker-hostname')
const remoteUrl = process.env.CVG_TESTS_REMOTE || 'http://localhost:4444/wd/hub'

exports.mochaHooks = {
  async beforeAll() {
    await checkForDockerHostname()
    await waitForDockerBrowsers({
      remoteUrl: remoteUrl + '/status',
      retries: Number(process.env.CVG_TESTS_DOCKER_RETRY_COUNT) || 70,
    })
  },
}
