import {readFileSync} from 'fs'
import {makeImage} from '@applitools/image'
import {resolve as resolvePath} from 'path'
import {pathToFileURL} from 'url'
import {testServer} from '@applitools/test-server'
import {transformImage} from '../../src/utils/transform-image'
import assert from 'assert'

describe('transform-images', () => {
  const expected = {png: Buffer.alloc(0), jpeg: Buffer.alloc(0)}
  let server, baseUrl

  before(async () => {
    expected.png = await makeImage('./test/fixtures/screenshot.png').toPng()
    expected.jpeg = await makeImage('./test/fixtures/screenshot.jpeg').toPng()
    server = await testServer()
    baseUrl = `http://localhost:${server.port}`
  })

  after(async () => {
    await server.close()
  })

  it('image buffer in png format', async () => {
    const result = await transformImage({image: readFileSync('./test/fixtures/screenshot.png'), settings: {}})
    assert(Buffer.compare(result, expected.png) === 0)
  })

  it('image base64 in png format', async () => {
    const result = await transformImage({image: readFileSync('./test/fixtures/screenshot.png').toString('base64'), settings: {}})
    assert(Buffer.compare(result, expected.png) === 0)
  })

  it('image path in png format', async () => {
    const result = await transformImage({image: resolvePath('./test/fixtures/screenshot.png'), settings: {}})
    assert(Buffer.compare(result, expected.png) === 0)
  })

  it('image file url object in png format', async () => {
    const result = await transformImage({image: pathToFileURL(resolvePath('./test/fixtures/screenshot.png')), settings: {}})
    assert(Buffer.compare(result, expected.png) === 0)
  })

  it('image file url string in png format', async () => {
    const result = await transformImage({image: pathToFileURL(resolvePath('./test/fixtures/screenshot.png')).href, settings: {}})
    assert(Buffer.compare(result, expected.png) === 0)
  })

  it('image http url object in png format', async () => {
    const result = await transformImage({image: new URL(`${baseUrl}/screenshot.png`), settings: {}})
    assert(Buffer.compare(result, expected.png) === 0)
  })

  it('image http url string in png format', async () => {
    const result = await transformImage({image: `${baseUrl}/screenshot.png`, settings: {}})
    assert(Buffer.compare(result, expected.png) === 0)
  })

  it('image buffer in jpeg format', async () => {
    const result = await transformImage({image: readFileSync('./test/fixtures/screenshot.jpeg'), settings: {}})
    assert(Buffer.compare(result, expected.jpeg) === 0)
  })

  it('image base64 in jpeg format', async () => {
    const result = await transformImage({image: readFileSync('./test/fixtures/screenshot.jpeg').toString('base64'), settings: {}})
    assert(Buffer.compare(result, expected.jpeg) === 0)
  })

  it('image path in jpeg format', async () => {
    const result = await transformImage({image: resolvePath('./test/fixtures/screenshot.jpeg'), settings: {}})
    assert(Buffer.compare(result, expected.jpeg) === 0)
  })

  it('image file url object in jpeg format', async () => {
    const result = await transformImage({image: pathToFileURL(resolvePath('./test/fixtures/screenshot.jpeg')), settings: {}})
    assert(Buffer.compare(result, expected.jpeg) === 0)
  })

  it('image file url string in jpeg format', async () => {
    const result = await transformImage({image: pathToFileURL(resolvePath('./test/fixtures/screenshot.jpeg')).href, settings: {}})
    assert(Buffer.compare(result, expected.jpeg) === 0)
  })

  it('image http url object in jpeg format', async () => {
    const result = await transformImage({image: new URL(`${baseUrl}/screenshot.jpeg`), settings: {}})
    assert(Buffer.compare(result, expected.jpeg) === 0)
  })

  it('image http url string in jpeg format', async () => {
    const result = await transformImage({image: `${baseUrl}/screenshot.jpeg`, settings: {}})
    assert(Buffer.compare(result, expected.jpeg) === 0)
  })
})
