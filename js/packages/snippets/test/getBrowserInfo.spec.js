const assert = require('assert')
const {getBrowserInfo} = require('../dist/index')

describe('getBrowserInfo', () => {
  const url = 'https://applitools.github.io/demo/TestPages/SnippetsTestPage/'

  describe('chrome', () => {
    let page

    before(async function() {
      page = await global.getDriver('chrome')
      if (!page) {
        this.skip()
      }
    })

    it('return browser info', async () => {
      await page.goto(url)
      let result
      do {
        result = JSON.parse(await page.evaluate(getBrowserInfo))
      } while (result.status && result.status === 'WIP')
      const browserInfo = result.value
      assert.deepStrictEqual(browserInfo, {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
        pixelRatio: 1,
        viewportScale: 1,
        userAgentData: {
          brands: [{brand: 'browser', version: '1'}],
          mobile: false,
          model: 'Laptop',
          platform: 'macOS',
          platformVersion: 'Monterey',
        },
      })
    })
  })

  for (const name of ['internet explorer', 'ios safari']) {
    const expectedBrowserInfos = {
      'internet explorer': {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko',
        pixelRatio: 1,
      },
      'ios safari': {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1',
        pixelRatio: 3,
        viewportScale: 1,
      },
    }

    describe(name, () => {
      let driver

      before(async function() {
        driver = await global.getDriver(name)
        if (!driver) {
          this.skip()
        }
      })

      it('return browser info', async () => {
        await driver.url(url)
        let result
        do {
          result = JSON.parse(await driver.execute(getBrowserInfo))
        } while (result.status === 'WIP')
        const browserInfo = result.value
        assert.deepStrictEqual(browserInfo, expectedBrowserInfos[name])
      })
    })
  }
})
