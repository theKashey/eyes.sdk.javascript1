import {Builder} from 'selenium-webdriver'
import {makeServer} from '../../src'

describe('proxy', () => {
  let proxy

  afterEach(async () => {
    await proxy.server.close()
  })

  it('works with real server', async () => {
    proxy = await makeServer({serverUrl: 'https://eyes.applitools.com', apiKey: process.env.APPLITOOLS_API_KEY})

    const driver = await new Builder().forBrowser('chrome').usingServer(proxy.url).build()

    await driver.get('https://applitools.com')

    await driver.quit()
  })
})
