const assert = require('assert')
const checkForDockerHostname = require('../src/check-for-docker-hostname')
const waitForDockerBrowsers = require('../src/wait-for-docker-browsers')

describe('docker', () => {
  it('checkForDockerHostname does not run on Linux', () => {
    return assert.doesNotThrow(async () => {
      await checkForDockerHostname({platform: 'linux'})
    })
  })

  it('waitForDockerBrowsers waits the correct amount of time', async () => {
    process.env.CVG_TESTS_REMOTE = undefined
    process.env.CVG_TESTS_DOCKER_RETRY_COUNT = 1
    const start = Date.now()
    try {await waitForDockerBrowsers()} catch (error) {}
    const end = Date.now()
    assert.ok((end - start) > 300)
  })
})
