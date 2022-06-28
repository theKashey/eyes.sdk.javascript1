'use strict'

const {Eyes, BatchInfo, ConsoleLogHandler, Target} = require('../../index')
const {getTestInfo} = require('@applitools/test-utils')
const assert = require('assert')

describe('TestVariantId', function() {
  let batch

  before(() => {
    batch = new BatchInfo('TestEyesImages')
  })

  function setup(testTitle) {
    const eyes = new Eyes()
    eyes.setBatch(batch)
    eyes.setLogHandler(new ConsoleLogHandler())

    eyes.getLogger().log(`running test: ${testTitle}`)
    eyes.setApiKey(process.env.APPLITOOLS_API_KEY)
    return eyes
  }

  it('TestVariantId', async function() {
    const eyes = setup(this.test.title)
    await eyes.open('TestEyesImages', 'TestVariantId', {width: 1024, height: 768})

    await eyes.check(
      'CheckVariantId',
      Target.image(`${__dirname}/../fixtures/jssdks.png`).variationGroupId('some variant'),
    )
    const results = await eyes.close(false)
    const testInfo = await getTestInfo(results, process.env.APPLITOOLS_API_KEY)
    assert.strictEqual(testInfo.actualAppOutput[0].knownVariantId, 'some variant')
  })
})
