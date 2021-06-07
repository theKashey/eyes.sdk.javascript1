const assert = require('assert')
const {setViewportSize} = require('../../../lib/sdk/EyesUtils')
const RectangleSize = require('../../../lib/geometry/RectangleSize')

describe('EyesUtils', () => {
  describe('setViewportSize', () => {
    it('works', async () => {
      let windowRect
      const counters = {
        setWindowSize: 0,
      }
      const logger = {
        verbose: () => {},
      }
      const context = {
        execute: () => {
          const result = windowRect || {width: 1280, height: 800}
          return new RectangleSize(result)
        },
        driver: {
          setWindowSize: async input => {
            if (input && input._width && input._height) {
              windowRect = input
              counters.setWindowSize++
            }
          },
          getWindowSize: () => {
            const result = windowRect || {width: 1280, height: 800}
            return new RectangleSize(result)
          },
        },
      }
      const requiredViewportSize = new RectangleSize({width: 800, height: 600})
      // eslint-disable-next-line
      await setViewportSize(logger, context, requiredViewportSize)
      assert.deepStrictEqual(counters.setWindowSize, 1)
    })
    it('throws the correct error when unable to set the viewport size', async () => {
      const counters = {
        setWindowSize: 0,
      }
      const logger = {
        verbose: () => {},
      }
      const context = {
        execute: () => {
          return new RectangleSize({width: 100, height: 200})
        },
        driver: {
          setWindowSize: async input => {
            if (input && input._width && input._height) {
              counters.setWindowSize++
            }
          },
          getWindowSize: () => {
            return new RectangleSize({width: 200, height: 300})
          },
        },
      }
      const requiredViewportSize = new RectangleSize({width: 2024, height: 4048})
      // eslint-disable-next-line
      await assert.rejects(async () => {await setViewportSize(logger, context, requiredViewportSize)}, /Failed to set viewport size!/)
      assert.deepStrictEqual(counters.setWindowSize, 3)
    })
  })
})
