'use strict'

const {Eyes, BatchInfo, ConsoleLogHandler, MatchLevel, RectangleSize} = require('../../index')

describe('TestLayout2', function() {
  this.timeout(5 * 60 * 1000)

  let batch

  before(() => {
    batch = new BatchInfo('Layout2')
  })

  function setup(testName) {
    const eyes = new Eyes()
    eyes.setBaselineEnvName(batch.name)
    eyes.setBatch(batch)
    eyes.setLogHandler(new ConsoleLogHandler())
    eyes.setMatchLevel(MatchLevel.Layout2)
    eyes.setSaveNewTests(true)

    eyes.getLogger().log(`running test: ${testName}`)
    return eyes
  }

  it('TestYahoo2ac', async function() {
    const open = async eyes => {
      await eyes.open('TestLayout2', 'Yahoo Chrome vs. IE', new RectangleSize(1024, 768))
    }
    let eyes = setup(this.test.title)
    await open(eyes)
    await eyes.checkImage(`${__dirname}/../fixtures/yahoo2c-chrome.png`)
    await eyes.close()

    eyes = setup(this.test.title)
    await open(eyes)
    await eyes.checkImage(`${__dirname}/../fixtures/yahoo2a-ie.png`)
    await eyes.close()
  })

  //it('TestYahoo2be', async function() {
  //  const eyes = setup(this.test.title)
  //  eyes.setAppEnvironment('Windows 6.1', 'Chrome')

  //  await eyes.open(appName, 'Yahoo dynamic content', new RectangleSize(1024, 768))

  //  await _check(eyes, 'yahoo2b-chrome.png', 'yahoo2e-chrome.png')
  //  await teardown(eyes)
  //})

  //it('TestAol1ab', async function() {
  //  const eyes = setup(this.test.title)
  //  eyes.setAppEnvironment('Windows 6.1', 'Firefox')

  //  await eyes.open(appName, 'AOL dynamic content', new RectangleSize(1024, 768))

  //  await _check(eyes, 'aol1a.png', 'aol1b.png')
  //  await teardown(eyes)
  //})

  //it('TestPaychex2', async function() {
  //  const eyes = setup(this.test.title)
  //  if (baseline) {
  //    eyes.setAppEnvironment('Windows 6.1', 'Chrome')
  //  } else {
  //    eyes.setAppEnvironment('Windows 6.1', 'IE')
  //  }

  //  await eyes.open(appName, 'Paychex Chrome vs. IE + bug', new RectangleSize(1024, 768))

  //  await _check(eyes, 'paychex1a.png', 'paychex1b.png')
  //  await teardown(eyes)
  //})

  //it('TestTwitter1df', async function() {
  //  const eyes = setup(this.test.title)
  //  if (baseline) {
  //    eyes.setAppEnvironment('Android', 'Samsung S4')
  //  } else {
  //    eyes.setAppEnvironment('Android', 'Samsung S5')
  //  }

  //  await eyes.open(appName, 'Twitter dynamic content S4 vs S5', new RectangleSize(1024, 768))

  //  await _check(eyes, 'twitter1d-s4.png', 'twitter1f-s5.png')
  //  await teardown(eyes)
  //})

  //it('TestTwitter1dg', async function() {
  //  const eyes = setup(this.test.title)
  //  if (baseline) {
  //    eyes.setAppEnvironment('Android', 'Samsung S4')
  //  } else {
  //    eyes.setAppEnvironment('Android', 'Samsung S5')
  //  }

  //  await eyes.open(appName, 'Twitter dynamic content S4 vs S5 + bug', new RectangleSize(1024, 768))

  //  await _check(eyes, 'twitter1d-s4.png', 'twitter1g-s5.png')
  //  await teardown(eyes)
  //})

  //it('TestDropbox1ab', async function() {
  //  const eyes = setup(this.test.title)
  //  if (baseline) {
  //    eyes.setAppEnvironment('Windows 6.1', 'Chrome')
  //  } else {
  //    eyes.setAppEnvironment('Windows 6.1', 'IE')
  //  }

  //  await eyes.open(appName, 'Dropbox Chrome vs. IE', new RectangleSize(1024, 768))

  //  await _check(eyes, 'dropbox1a-chrome.png', 'dropbox1b-ie.png')
  //  await teardown(eyes)
  //})
})
