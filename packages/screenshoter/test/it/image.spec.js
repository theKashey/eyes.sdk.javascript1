const assert = require('assert')
const fs = require('fs')
const pixelmatch = require('pixelmatch')
const makeImage = require('../../src/image')

describe('image', () => {
  it('should provide access to image width/height before it parsed', async () => {
    const buffer = fs.readFileSync('./test/fixtures/image/house.png')
    const image = makeImage(buffer)
    assert.strictEqual(image.width, 612)
    assert.strictEqual(image.height, 512)
  })

  it('should crop by region', async () => {
    const actual = await makeImage('./test/fixtures/image/house.png')
      .crop({x: 200, y: 220, width: 200, height: 200})
      .then(image => image.toObject())

    const expected = await makeImage('./test/fixtures/image/house.cropped-region.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })

  it('should crop by rect', async () => {
    const actual = await makeImage('./test/fixtures/image/house.png')
      .crop({left: 100, right: 110, top: 120, bottom: 130})
      .then(image => image.toObject())
    const expected = await makeImage('./test/fixtures/image/house.cropped-rect.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })

  it('should crop a big image without heap overflow', async () => {
    const actual = await makeImage({width: 1000, height: 50000})
      .crop({x: 0, y: 0, width: 1000, height: 49500})
      .then(image => image.toObject())
    assert.strictEqual(actual.width, 1000)
    assert.strictEqual(actual.height, 49500)
  })

  it('should scale', async () => {
    const actual = await makeImage('./test/fixtures/image/house.png')
      .scale(0.5)
      .then(image => image.toObject())
    const expected = await makeImage('./test/fixtures/image/house.scaled.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })

  it('should rotate', async () => {
    const actual = await makeImage('./test/fixtures/image/house.png')
      .rotate(90)
      .then(image => image.toObject())
    const expected = await makeImage('./test/fixtures/image/house.rotated.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })

  it('should rotate a big image without heap overflow', async () => {
    const actual = await makeImage({width: 1000, height: 50000})
      .rotate(270)
      .then(image => image.toObject())
    assert.strictEqual(actual.width, 50000)
    assert.strictEqual(actual.height, 1000)
  })

  it('should copy one image to another', async () => {
    const image = await makeImage('./test/fixtures/image/house.png').toObject()
    const composition = makeImage({width: image.width, height: image.height * 2})
    await composition.copy(image, {x: 0.1, y: 0.2})
    await composition.copy(image, {x: 0, y: image.height})
    const actual = await composition.toObject()
    const expected = await makeImage('./test/fixtures/image/house.stitched.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })

  it('should copy a big image without heap overflow', async () => {
    const source = await makeImage({width: 1000, height: 50000}).toObject()
    const actual = await makeImage({width: 1000, height: 50000})
      .copy(source, {x: 100, y: 500})
      .then(image => image.toObject())
    assert.strictEqual(actual.width, 1000)
    assert.strictEqual(actual.height, 50000)
  })

  it('should replace region in image with a higher and wider image', async () => {
    const image = await makeImage('./test/fixtures/image/house.png')
    const replace = await makeImage({width: 200, height: 200}).toObject()
    replace.data.fill(Buffer.from([0xff, 0, 0, 0xff]))
    await replace.combine(image, image, {x: 200, y: 200, width: 100, height: 100})
    const actual = await image.toObject()
    const expected = await makeImage('./test/fixtures/image/house.replaced-higher-wider.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })

  it('should replace region in image with a higher image', async () => {
    const image = await makeImage('./test/fixtures/image/house.png')
    const replace = await makeImage({width: 200, height: 200}).toObject()
    replace.data.fill(Buffer.from([0, 0xff, 0, 0xff]))
    await replace.combine(image, image, {x: 200, y: 200, width: 200, height: 100})
    const actual = await image.toObject()
    const expected = await makeImage('./test/fixtures/image/house.replaced-higher.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })

  it('should replace region in image with a higher image', async () => {
    const image = await makeImage('./test/fixtures/image/house.png')
    const replace = await makeImage({width: 200, height: 200}).toObject()
    replace.data.fill(Buffer.from([0, 0, 0xff, 0xff]))
    await replace.combine(image, image, {x: 200, y: 200, width: 100, height: 200})
    const actual = await image.toObject()
    const expected = await makeImage('./test/fixtures/image/house.replaced-wider.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })
})
