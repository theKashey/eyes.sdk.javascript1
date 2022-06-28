import assert from 'assert'
import * as spec from '../../src'

describe('spec driver', async () => {
  let browser: spec.Driver
  describe('unconventional service provider', async () => {
    before(async () => {
      browser = {
        $: errorState => {
          switch (errorState) {
            case 'non-existent-generic-error':
              throw new Error('An element could not be located on the page using the given search parameters.')
            case 'non-existent-specific-error-v1':
              throw new Error(`Cannot locate an element using [selector]`)
            case 'non-existent-specific-error-v2':
              throw new Error(`Element with [selector] wasn't found.`)
            case 'valid-error':
              throw new Error('valid error')
          }
        },
      }
    })

    it('findElement(non-existent-errors)', async () => {
      assert.deepStrictEqual(await spec.findElement(browser, 'non-existent-generic-error'), null)
      assert.deepStrictEqual(await spec.findElement(browser, 'non-existent-specific-error-v1'), null)
      assert.deepStrictEqual(await spec.findElement(browser, 'non-existent-specific-error-v2'), null)
    })

    it('findElement(valid-error)', async () => {
      assert.rejects(async () => await spec.findElement(browser, 'valid-error'), Error)
    })

    it('getCapabilities(incompatible-command)', async () => {
      const browser = {
        getSession: () => {
          throw new Error('unknown command: Cannot call non W3C standard command while in W3C mode')
        },
        capabilities: {},
      }
      assert.deepStrictEqual(await spec.getCapabilities(browser), {})
    })
  })
})
