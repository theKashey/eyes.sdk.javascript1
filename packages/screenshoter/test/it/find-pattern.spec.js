const assert = require('assert')
const makeImage = require('../../src/image')
const findPattern = require('../../src/find-image-pattern')

describe('pattern', () => {
  const fixtures = [
    {name: 'iPhone_5S_landscape', position: {x: 0, y: 100}, pixelRatio: 2},
    {name: 'iPhone_X_perfecto_portrait', position: {x: 0, y: 297}, pixelRatio: 3},
    {name: 'iPhone_XR_perfecto_landscape', position: {x: 88, y: 100}, pixelRatio: 2},
    {name: 'iPhone_XS_Max_perfecto_landscape', position: {x: 132, y: 150}, pixelRatio: 3},
    {name: 'iPhone_XS_landscape', position: {x: 132, y: 150}, pixelRatio: 3},
    {name: 'iPhone_XS_portrait', position: {x: 0, y: 282}, pixelRatio: 3},
    {name: 'iPad_Air_portrait', position: {x: 0, y: 140}, pixelRatio: 2},
    {name: 'iPhone_XS_portrait_nomarker', position: null, pixelRatio: 3},
  ]

  fixtures.forEach(({name, position, pixelRatio}) => {
    it(name, async () => {
      const image = await makeImage(`./test/fixtures/pattern/${name}.png`)
      const result = findPattern(await image.toObject(), {
        offset: 1 * pixelRatio,
        size: 3 * pixelRatio,
        mask: [0, 1, 0],
      })
      assert.deepStrictEqual(result, position)
    })
  })
})
