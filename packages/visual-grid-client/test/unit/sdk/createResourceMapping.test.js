/* global fetch */
require('@applitools/isomorphic-fetch')
const {expect} = require('chai')
const {testServerInProcess} = require('@applitools/test-server')
const makeFetchResource = require('../../../src/sdk/resources/fetchResource')
const makePutResources = require('../../../src/sdk/resources/putResources')
const makeProcessResources = require('../../../src/sdk/resources/processResources')
const makeCreateResourceMapping = require('../../../src/sdk/resources/createResourceMapping')
const createResource = require('../../../src/sdk/resources/createResource')
const createDomResource = require('../../../src/sdk/resources/createDomResource')
const testLogger = require('../../util/testLogger')
const {loadJsonFixture, loadFixtureBuffer} = require('../../util/loadFixture')
const getTestCssResources = require('../../util/getTestCssResources')

describe('createResourceMapping', () => {
  let server, baseUrl, createResourceMapping

  before(async () => {
    server = await testServerInProcess()
    baseUrl = `http://localhost:${server.port}`
  })

  after(async () => {
    await server.close()
  })

  beforeEach(() => {
    const processResources = makeProcessResources({
      fetchResource: makeFetchResource({fetch, logger: testLogger}),
      putResources: makePutResources({
        doCheckResources: async resources => Array(resources.length).fill(true),
      }),
      logger: testLogger,
    })
    createResourceMapping = makeCreateResourceMapping({processResources})
  })

  it('works', async () => {
    const pageUrl = `${baseUrl}/iframes/frame.html`
    const pageCdt = loadJsonFixture('inner-frame.cdt.json')

    const frame1Url = `${baseUrl}/test.html`
    const frame1Cdt = loadJsonFixture('test.cdt.json')

    const frame2Url = `${baseUrl}/iframes/inner/test.html`
    const frame2Cdt = loadJsonFixture('iframes/inner/test.cdt.json')

    const imgResourcePath = 'iframes/inner/smurfs.jpg'
    const imgResourceUrl = `${baseUrl}/${imgResourcePath}`

    const snapshot = {
      url: pageUrl,
      cdt: pageCdt,
      resourceUrls: [],
      resourceContents: {},
      frames: [
        {
          url: frame1Url,
          cdt: frame1Cdt,
          resourceUrls: [`${baseUrl}/test.css`],
          resourceContents: {},
        },
        {
          url: frame2Url,
          cdt: frame2Cdt,
          resourceUrls: [imgResourceUrl],
          resourceContents: {},
        },
      ],
    }

    const {dom, resources} = await createResourceMapping({snapshot})

    const expectedImgResource = createResource({
      url: imgResourceUrl,
      type: 'image/jpeg',
      value: loadFixtureBuffer(imgResourcePath),
    })

    const expectedFrame1DomResource = createDomResource({
      cdt: frame1Cdt,
      resources: getTestCssResources(baseUrl),
    })

    const expectedFrame2DomResource = createDomResource({
      cdt: frame2Cdt,
      resources: {
        [imgResourceUrl]: expectedImgResource.hash,
      },
    })

    const expectedDomResource = createDomResource({
      cdt: pageCdt,
      resources: {
        [frame1Url]: expectedFrame1DomResource.hash,
        [frame2Url]: expectedFrame2DomResource.hash,
      },
    })

    const resultFrame1DomResourceHash = resources[frame1Url]
    expect(resultFrame1DomResourceHash).to.eql(expectedFrame1DomResource.hash)

    const resultFrame2DomResourceHash = resources[frame2Url]
    expect(resultFrame2DomResourceHash).to.eql(expectedFrame2DomResource.hash)

    expect(dom).to.eql(expectedDomResource.hash)
  })
})
