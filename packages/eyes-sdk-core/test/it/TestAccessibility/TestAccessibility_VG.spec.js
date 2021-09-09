'use strict'
const {MockDriver} = require('@applitools/driver')
const snippets = require('@applitools/snippets')
const {generateDomSnapshot} = require('../../utils/FakeDomSnapshot')
const {runTest} = require('./TestAccessibility_utils')

describe('TestAccessibility', () => {
  let driver

  before(async () => {
    driver = new MockDriver()
    driver.mockScript('dom-snapshot', () => generateDomSnapshot(driver))
    driver.mockScript(snippets.addElementIds, ([elements, ids]) => {
      const selectors = []
      for (const [index, element] of elements.entries()) {
        const elementId = ids[index]
        element.attributes = element.attributes || []
        element.attributes.push({name: 'data-applitools-selector', value: elementId})
        const selector = `[data-applitools-selector~="${elementId}"]`
        selectors.push([selector])
      }
      return selectors
    })
    driver.mockElements([
      {selector: 'element1', rect: {x: 10, y: 11, width: 101, height: 102}},
      {selector: 'element2', rect: {x: 20, y: 21, width: 201, height: 202}},
      {selector: 'element2', rect: {x: 30, y: 31, width: 301, height: 302}},
    ])
  })

  it('TestAccessibility_VG', async () => {
    await runTest(driver, true)
  })
})
