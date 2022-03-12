const {promisify} = require('util')
const fetch = require('node-fetch')
const delay = promisify(setTimeout)

async function waitForDockerBrowsers({remoteUrl, retries} = {}) {
  if (!remoteUrl)
    throw new Error(
      'URL not provided for container health check (e.g., typically through the CVG_TESTS_REMOTE env var)',
    )
  if (retries === 0) throw new Error('browsers docker containers failed to start before running tests')
  try {
    const result = await fetch(remoteUrl)
    if (result.status === 200) return
    await delay(300)
    return waitForDockerBrowsers({remoteUrl, retries: retries - 1})
  } catch (ex) {
    console.log('waitForDockerBrowsers error:', ex)
    await delay(300)
    return waitForDockerBrowsers({remoteUrl, retries: retries - 1})
  }
}

module.exports = waitForDockerBrowsers
