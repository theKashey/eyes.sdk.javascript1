import {type UFGRequests} from '../../src/server/requests'
import {makeCreateRenderTarget} from '../../src/create-render-target'
import {makeFetchResource} from '../../src/fetch-resource'
import {makeUploadResource} from '../../src/upload-resource'
import {makeProcessResources} from '../../src/process-resources'
import {makeResourceDom} from '../../src/resource-dom'
import {testServer} from '@applitools/test-server'
import assert from 'assert'
import {makeFixtureResource as makeFixtureFrame1Resource} from '../fixtures/page/index.resource'
import {makeFixtureResource as makeFixtureFrame2Resource} from '../fixtures/page-with-frames/inner/frame.resource'

describe('create-render-target', () => {
  let server, baseUrl

  before(async () => {
    server = await testServer()
    baseUrl = `http://localhost:${server.port}`
  })

  after(async () => {
    await server.close()
  })

  it('works', async () => {
    const processResources = makeProcessResources({
      fetchResource: makeFetchResource(),
      uploadResource: makeUploadResource({
        requests: {
          checkResources: async ({resources}) => Array(resources.length).fill(true),
        } as UFGRequests,
      }),
    })
    const createRenderTarget = makeCreateRenderTarget({processResources})
    const pageUrl = `${baseUrl}/page-with-frames/index.html`
    const frame1Url = `${baseUrl}/page/index.html`
    const frame2Url = `${baseUrl}/page-with-frames/inner/frame.html`

    const snapshot = {
      url: pageUrl,
      cdt: [],
      resourceUrls: [],
      resourceContents: {},
      frames: [
        {
          url: frame1Url,
          cdt: require('../fixtures/page/index.cdt.json'),
          resourceUrls: [`${baseUrl}/page/test.css`],
          resourceContents: {},
        },
        {
          url: frame2Url,
          cdt: require('../fixtures/page-with-frames/inner/frame.cdt.json'),
          resourceUrls: [`${baseUrl}/page-with-frames/inner/smurfs.jpg`],
          resourceContents: {},
        },
      ],
    }

    const target = await createRenderTarget({snapshot})

    const expectedFrame1DomResource = makeFixtureFrame1Resource({baseUrl})
    assert.deepStrictEqual(target.resources[frame1Url], expectedFrame1DomResource.hash)

    const expectedFrame2DomResource = makeFixtureFrame2Resource({baseUrl})
    assert.deepStrictEqual(target.resources[frame2Url], expectedFrame2DomResource.hash)

    const expectedDomResource = makeResourceDom({
      cdt: [],
      resources: {
        [frame1Url]: expectedFrame1DomResource.hash,
        [frame2Url]: expectedFrame2DomResource.hash,
      },
    })
    assert.deepStrictEqual(target.snapshot, expectedDomResource.hash)
  })
})
