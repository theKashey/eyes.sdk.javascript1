const assert = require('assert')
const makeImage = require('../../src/image')
const findPattern = require('../../src/find-image-pattern')

describe('pattern', () => {
  const fixtures = [
    {name: 'iPhone_SE_portrait', position: {x: 0, y: 140}, offset: 0, size: 1, scale: 2},
    {name: 'iPhone_SE_landscape', position: {x: 0, y: 100}, offset: 0, size: 1, scale: 2},
    {name: 'iPhone_11_portrait', position: {x: 0, y: 282}, offset: 0, size: 1, scale: 3},
    {name: 'iPhone_11_landscape', position: {x: 132, y: 150}, offset: 0, size: 1, scale: 3},
    {name: 'iPhone_13_portrait', position: {x: 0, y: 141}, offset: 0, size: 1, scale: 3},
    {name: 'iPhone_13_landscape', position: {x: 141, y: 144}, offset: 0, size: 1, scale: 3},
    {name: 'iPad_5th_portrait', position: {x: 0, y: 140}, offset: 0, size: 1, scale: 2},
    {name: 'iPad_5th_landscape', position: {x: 0, y: 140}, offset: 0, size: 1, scale: 2},
    {name: 'iPad_9th_portrait', position: {x: 0, y: 136}, offset: 0, size: 1, scale: 2},
    {name: 'iPad_9th_landscape', position: {x: 640, y: 136}, offset: 1, size: 1, scale: 2},
    {name: 'iPhone_XS_portrait_noscale', position: {x: 0, y: 282}, offset: 0, size: 1, scale: 3},
    {name: 'iPad_Air_2_portrait_noscale', position: {x: 0, y: 136}, offset: 2, size: 2, scale: 1.5},
    {name: 'iPad_mini_4_landscape_noscale', position: {x: 640, y: 136}, offset: 16, size: 16, scale: 1.436734676361084},
    {name: 'iPad_Pro_5th_portrait_noscale', position: {x: 0, y: 144}, offset: 19, size: 19, scale: 1.8417266607284546},
    {name: 'iPad_9th_portrait_noscale', position: {x: 0, y: 136}, offset: 12, size: 12, scale: 1.58203125},
    {name: 'iPhone_XS_portrait_nomarker', position: null, offset: 0, size: 1, scale: 3},
  ]

  fixtures.forEach(({name, position, ...marker}) => {
    it(name, async () => {
      const image = await makeImage(`./test/fixtures/pattern/${name}.png`)
      const result = findPattern(await image.toObject(), {
        mask: [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1],
        ...marker,
      })
      assert.deepStrictEqual(result, position)
    })
  })
})
