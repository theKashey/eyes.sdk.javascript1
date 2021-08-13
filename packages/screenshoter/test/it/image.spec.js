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
      .toObject()
    const expected = await makeImage('./test/fixtures/image/house.cropped-region.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })

  it('should crop by rect', async () => {
    const actual = await makeImage('./test/fixtures/image/house.png')
      .crop({left: 100, right: 110, top: 120, bottom: 130})
      .toObject()
    const expected = await makeImage('./test/fixtures/image/house.cropped-rect.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })

  it('should crop a big image without heap overflow', async () => {
    const actual = await makeImage({width: 1000, height: 50000})
      .crop({x: 0, y: 0, width: 1000, height: 49500})
      .toObject()
    assert.strictEqual(actual.width, 1000)
    assert.strictEqual(actual.height, 49500)
  })

  it('should scale', async () => {
    const actual = await makeImage('./test/fixtures/image/house.png')
      .scale(0.5)
      .toObject()
    const expected = await makeImage('./test/fixtures/image/house.scaled.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })

  it('should rotate', async () => {
    const actual = await makeImage('./test/fixtures/image/house.png')
      .rotate(90)
      .toObject()
    const expected = await makeImage('./test/fixtures/image/house.rotated.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })

  it('should rotate a big image without heap overflow', async () => {
    const actual = await makeImage({width: 1000, height: 50000})
      .rotate(270)
      .toObject()
    assert.strictEqual(actual.width, 50000)
    assert.strictEqual(actual.height, 1000)
  })

  it('should copy one image to another', async () => {
    const image = makeImage('./test/fixtures/image/house.png')
    const composedImage = makeImage({width: image.width, height: image.height * 2})
    await composedImage.copy(image, {x: 0.1, y: 0.2})
    await composedImage.copy(image, {x: 0, y: image.height})
    const actual = await composedImage.toObject()
    const expected = await makeImage('./test/fixtures/image/house.stitched.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })

  it('should copy a big image without heap overflow', async () => {
    const source = makeImage({width: 1000, height: 50000})
    const composedImage = makeImage({width: 1000, height: 50000})
    await composedImage.copy(source, {x: 100, y: 500})
    const actual = await composedImage.toObject()
    assert.strictEqual(actual.width, 1000)
    assert.strictEqual(actual.height, 50000)
  })

  it('should replace region in image with a higher and wider image', async () => {
    const image = makeImage('./test/fixtures/image/house.png')
    const srcImage = makeImage({
      width: 200,
      height: 200,
      data: Buffer.alloc(200 * 200 * 4, Buffer.from([0xff, 0, 0, 0xff])),
    })
    const combinedImage = await srcImage.combine(image, image, {x: 200, y: 200, width: 100, height: 100})
    const actual = await combinedImage.toObject()
    const expected = await makeImage('./test/fixtures/image/house.combined-higher-wider.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })

  it('should replace region in image with a higher image', async () => {
    const image = await makeImage('./test/fixtures/image/house.png')
    const srcImage = makeImage({
      width: 200,
      height: 200,
      data: Buffer.alloc(200 * 200 * 4, Buffer.from([0, 0xff, 0, 0xff])),
    })
    const combinedImage = await srcImage.combine(image, image, {x: 200, y: 200, width: 200, height: 100})
    const actual = await combinedImage.toObject()
    const expected = await makeImage('./test/fixtures/image/house.combined-higher.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })

  it('should replace region in image with a higher image', async () => {
    const image = await makeImage('./test/fixtures/image/house.png')
    const srcImage = makeImage({
      width: 200,
      height: 200,
      data: Buffer.alloc(200 * 200 * 4, Buffer.from([0, 0, 0xff, 0xff])),
    })
    const combinedImage = await srcImage.combine(image, image, {x: 200, y: 200, width: 100, height: 200})
    const actual = await combinedImage.toObject()
    const expected = await makeImage('./test/fixtures/image/house.combined-wider.png').toObject()
    assert.ok(pixelmatch(actual.data, expected.data, null, expected.width, expected.height) === 0)
  })
})
