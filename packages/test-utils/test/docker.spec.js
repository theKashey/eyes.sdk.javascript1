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
    const start = Date.now()
    await assert.rejects(
      async () => {
        await waitForDockerBrowsers({remoteUrl: 'http://localhost:4443/wd/hub', retries: 1})
      },
      {message: /containers failed to start before running tests/},
    )
    const end = Date.now()
    assert.ok(end - start > 300)
  })

  it('waitForDockerBrowsers throws when the remote URL is not provided', () => {
    return assert.rejects(
      async () => {
        await waitForDockerBrowsers({remoteUrl: undefined, retries: 0})
      },
      {message: /URL not provided/},
    )
  })
})
