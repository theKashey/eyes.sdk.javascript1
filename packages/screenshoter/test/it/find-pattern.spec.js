const assert = require('assert')
const makeImage = require('../../src/image')
const findPattern = require('../../src/find-image-pattern')

describe('pattern', () => {
  const fixtures = [
    {name: 'iPhone_SE_portrait', position: {x: 0, y: 140}, offset: 0, pixelRatio: 2},
    {name: 'iPhone_SE_landscape', position: {x: 0, y: 100}, offset: 0, pixelRatio: 2},
    {name: 'iPhone_11_portrait', position: {x: 0, y: 282}, offset: 0, pixelRatio: 3},
    {name: 'iPhone_11_landscape', position: {x: 132, y: 150}, offset: 0, pixelRatio: 3},
    {name: 'iPhone_13_portrait', position: {x: 0, y: 141}, offset: 0, pixelRatio: 3},
    {name: 'iPhone_13_landscape', position: {x: 141, y: 144}, offset: 0, pixelRatio: 3},
    {name: 'iPad_5th_portrait', position: {x: 0, y: 140}, offset: 0, pixelRatio: 2},
    {name: 'iPad_5th_landscape', position: {x: 0, y: 140}, offset: 0, pixelRatio: 2},
    {name: 'iPad_9th_portrait', position: {x: 0, y: 136}, offset: 0, pixelRatio: 2},
    {name: 'iPad_9th_landscape', position: {x: 641, y: 137}, offset: 1, pixelRatio: 2},
    {name: 'iPhone_XS_portrait_noviewport', position: {x: 0, y: 282}, offset: 0, pixelRatio: 3},
    {name: 'iPhone_XS_portrait_nomarker', position: null, pixelRatio: 3},
  ]

  fixtures.forEach(({name, position, offset, pixelRatio}) => {
    it(name, async () => {
      const image = await makeImage(`./test/fixtures/pattern/${name}.png`)
      const result = findPattern(await image.toObject(), {
        pixelRatio,
        mask: [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1],
        offset,
        size: 1,
      })
      assert.deepStrictEqual(result, position)
    })
  })
})
