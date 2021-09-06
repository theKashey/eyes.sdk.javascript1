// check region by selector within shadow dom with vg
const path = require('path')
const {Selector} = require('testcafe')
const spec = require(path.resolve(process.cwd(), './dist/spec-driver'))
const setupEyes = require('@applitools/test-utils/src/setup-eyes')

let driver, destroyDriver, eyes

fixture`Coverage Tests`
  .beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    eyes = setupEyes({
      vg: true,
      displayName: 'check region by selector within shadow dom with vg',
      baselineName: 'CheckRegionBySelectorWithinShadowDomWithVg',
      driver: driver,
    })
  })
  .after(async () => {
    try {
      await eyes.abort()
    } finally {
      await destroyDriver(driver)
    }
  })
test('check region by selector within shadow dom with vg', async driver => {
  await spec.visit(driver, 'https://applitools.github.io/demo/TestPages/ShadowDOM/index.html')
  await eyes.open(driver, 'Applitools Eyes SDK', 'CheckRegionBySelectorWithinShadowDomWithVg', {
    width: 700,
    height: 460,
  })
  await eyes.check({region: Selector('#has-shadow-root').shadowRoot().find('h1')})
  await eyes.check({
    region: Selector('#has-shadow-root').shadowRoot().find('#has-shadow-root-nested > div').shadowRoot().find('div'),
  })
  await eyes.close(undefined)
})
