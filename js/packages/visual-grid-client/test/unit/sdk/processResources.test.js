/* global fetch */
require('@applitools/isomorphic-fetch')
const {expect} = require('chai')
const nock = require('nock')
const {testServerInProcess} = require('@applitools/test-server')
const makeProcessResources = require('../../../src/sdk/resources/processResources')
const makeFetchResource = require('../../../src/sdk/resources/fetchResource')
const makePutResources = require('../../../src/sdk/resources/putResources')
const createResource = require('../../../src/sdk/resources/createResource')
const logger = require('../../util/testLogger')
const {loadFixtureBuffer} = require('../../util/loadFixture')
const getTestCssResources = require('../../util/getTestCssResources')
const getTestSvgResources = require('../../util/getTestSvgResources')

describe('processResources', () => {
  let closeServer, baseUrl, fetchResource, putResources

  beforeEach(async () => {
    const server = await testServerInProcess()
    closeServer = server.close
    baseUrl = `http://localhost:${server.port}`

    fetchResource = makeFetchResource({fetch, logger})
    putResources = makePutResources({
      doCheckResources: async resources => Array(resources.length).fill(true),
      logger,
    })
  })

  afterEach(async () => {
    await closeServer()
  })

  it('works for absolute urls', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const jpgName = 'smurfs.jpg'
    const jpgUrl = `${baseUrl}/${jpgName}`
    const jpgResource = createResource({
      url: jpgUrl,
      type: 'image/jpeg',
      value: loadFixtureBuffer(jpgName),
    })

    const jsonName = 'test.cdt.json'
    const jsonUrl = `${baseUrl}/${jsonName}`
    const jsonResource = createResource({
      url: jsonUrl,
      type: 'application/json; charset=UTF-8',
      value: loadFixtureBuffer(jsonName),
    })

    const cssName = 'test.css'
    const cssUrl = `${baseUrl}/${cssName}`
    const cssResource = createResource({url: cssUrl})

    const jsName = 'test.js'
    const jsUrl = `${baseUrl}/${jsName}`
    const jsResource = createResource({
      url: jsUrl,
      type: 'application/javascript; charset=UTF-8',
      value: loadFixtureBuffer(jsName),
    })

    const resources = await processResources({
      resources: {
        [jpgUrl]: jpgResource,
        [jsonUrl]: jsonResource,
        [jsUrl]: jsResource,
        [cssUrl]: cssResource,
      },
    })
    expect(resources.mapping).to.eql({
      [jpgUrl]: jpgResource.hash,
      [jsonUrl]: jsonResource.hash,
      [jsUrl]: jsResource.hash,
      ...getTestCssResources(baseUrl),
    })
  })

  it('works for urls with long paths', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const path = `long/path/to/something.js`
    const absoluteUrl = `${baseUrl}/${path}`

    const resources = await processResources({
      resources: {
        [absoluteUrl]: createResource({url: absoluteUrl}),
      },
    })
    expect(resources.mapping).to.eql({
      [absoluteUrl]: createResource({
        url: absoluteUrl,
        type: 'application/javascript; charset=UTF-8',
        value: loadFixtureBuffer(path),
      }).hash,
    })
  })

  it('works for svg urls', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const svg1Name = 'basic.svg'
    const svg1Url = `${baseUrl}/${svg1Name}`
    const svg1UrlResource = createResource({url: svg1Url})
    const svg1Resource = createResource({
      url: svg1Url,
      type: 'image/svg+xml',
      value: loadFixtureBuffer(svg1Name),
    })

    const svg2Name = 'basic2.svg'
    const svg2Url = `${baseUrl}/${svg2Name}`
    const svg2UrlResource = createResource({url: svg2Url})
    const svg2Resource = createResource({
      url: svg2Url,
      type: 'image/svg+xml',
      value: loadFixtureBuffer(svg2Name),
    })

    const svg3Name = 'with-style.svg'
    const svg3Url = `${baseUrl}/${svg3Name}`
    const svg3UrlResource = createResource({url: svg3Url})
    const svg3Resource = createResource({
      url: svg3Url,
      type: 'image/svg+xml',
      value: loadFixtureBuffer(svg3Name),
    })

    const resources = await processResources({
      resources: {
        [svg1Url]: svg1UrlResource,
        [svg2Url]: svg2UrlResource,
        [svg3Url]: svg3UrlResource,
      },
    })
    expect(resources.mapping).to.eql({
      [svg1Url]: svg1Resource.hash,
      [svg2Url]: svg2Resource.hash,
      [svg3Url]: svg3Resource.hash,
      ...getTestSvgResources(baseUrl),
    })
  })

  it('fetches with cache', async () => {
    const fakeResource = createResource({url: 'fake-url', type: 'type', value: 'content'})
    const fakeUrlResource = createResource({url: 'fake-url'})
    const processResources = makeProcessResources({
      fetchResource,
      putResources,
      resourceCache: new Map([[fakeResource.url, {hash: fakeResource.hash}]]),
      logger,
    })

    const resourcesFromCache = await processResources({
      resources: {[fakeUrlResource.url]: fakeUrlResource},
    })
    expect(resourcesFromCache.mapping).to.eql({
      [fakeUrlResource.url]: fakeResource.hash,
    })
  })

  it('fetches with user-agent and referer headers', async () => {
    const url = 'http://url.com'
    const referer = 'some-referer'
    const userAgent = 'some-user-agent'
    const fetchResource = makeFetchResource({
      async fetch(fetchedUrl, options) {
        expect(fetchedUrl).to.eql(url)
        expect(options.headers).to.eql({Referer: referer, 'User-Agent': userAgent})
        return {
          ok: true,
          buffer: async () => 'content',
          headers: new Map([['Content-Type', 'text/plain']]),
        }
      },
      logger,
    })

    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const resources = await processResources({
      resources: [createResource({url})],
      referer,
      userAgent,
    })

    expect(resources.mapping).to.eql({
      [url]: createResource({url, type: 'text/plain', value: 'content'}).hash,
    })
  })

  it('sets and gets css/svg resources from cache', async () => {
    let called = 0
    const resource = createResource({url: 'http://url.com', type: 'text/css', value: 'content'})
    const fetchResource = async () => (++called, resource)
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const urlResource = createResource({url: resource.url})

    const resources = await processResources({
      resources: {[urlResource.url]: urlResource},
    })
    const resourcesFromCache = await processResources({
      resources: {[urlResource.url]: urlResource},
    })

    expect(called).to.eql(1)

    const expected = {[resource.url]: resource.hash}

    expect(resources.mapping).to.eql(expected)
    expect(resourcesFromCache.mapping).to.eql(expected)
  })

  it('gets inner css resources also for cached resources', async () => {
    const baseUrl = 'http://url.com'
    const resourceMapping = getTestCssResources(baseUrl)
    delete resourceMapping[`${baseUrl}/predefined-status/403`]
    delete resourceMapping[`${baseUrl}/predefined-status/404`]
    delete resourceMapping[`${baseUrl}/predefined-status/hangup`]

    const resourceCache = new Map(
      Object.entries(resourceMapping).map(([url, hash]) => {
        return [url, {hash}]
      }),
    )

    const cssName = 'test.css'
    const cssUrl = `${baseUrl}/${cssName}`

    resourceCache.get(cssUrl).dependencies = [
      `${baseUrl}/imported.css`,
      `${baseUrl}/zilla_slab.woff2`,
    ]
    resourceCache.get(`${baseUrl}/imported.css`).dependencies = [
      `${baseUrl}/imported-nested.css`,
      `${baseUrl}/shadows_into_light.woff2`,
      `${baseUrl}/smurfs1.jpg`,
      `${baseUrl}/smurfs2.jpg`,
      `${baseUrl}/smurfs3.jpg`,
    ]

    const processResources = makeProcessResources({
      fetchResource,
      putResources,
      resourceCache,
      logger,
    })

    const resourcesFromCache = await processResources({
      resources: {[cssUrl]: createResource({url: cssUrl})},
    })
    expect(resourcesFromCache.mapping).to.eql(resourceMapping)
  })

  it("doesn't crash with unsupported protocols", async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const dataUrl = 'data:text/html,<div>'
    const blobUrl = 'blob:http://localhost/something.css'
    const resources = await processResources({
      resources: {
        [dataUrl]: createResource({url: dataUrl}),
        [blobUrl]: createResource({url: blobUrl}),
      },
    })
    expect(resources.mapping).to.eql({})
  })

  it('handles empty resources', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const resource1 = createResource({url: 'one', type: 'some-type', value: null})
    const resource2 = createResource({url: 'two', type: 'some-type', value: 'some-content'})

    const resources = await processResources({
      resources: {[resource1.url]: resource1, [resource2.url]: resource2},
    })

    expect(resources.mapping).to.eql({
      [resource1.url]: resource1.hash,
      [resource2.url]: resource2.hash,
    })
  })

  it('handles empty resources extracted from cache', async () => {
    const resource = createResource({
      url: 'https://some.com/img.jpg',
      type: 'image/jpeg',
      value: null,
    })
    const fetchResource = () => {}
    const processResources = makeProcessResources({
      fetchResource,
      putResources,
      resourceCache: new Map([[resource.url, {hash: resource.hash}]]),
      logger,
    })

    const resourcesFromCache = await processResources({
      resources: {[resource.url]: createResource({url: resource.url})},
    })

    expect(resourcesFromCache.mapping).to.eql({
      [resource.url]: resource.hash,
    })
  })

  it('handles uppercase urls', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const resource = createResource({
      url: `${baseUrl.toUpperCase()}/imported2.css`,
      type: 'text/css; charset=UTF-8',
      value: loadFixtureBuffer('imported2.css'),
    })

    const resources = await processResources({
      resources: {[resource.url]: createResource({url: resource.url})},
    })
    expect(resources.mapping).to.eql({[resource.url]: resource.hash})
  })

  it('gets resources from prefilled resources', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const cssName = 'blob.css'
    const cssUrl = `${baseUrl}/${cssName}`
    const cssResource = createResource({
      url: cssUrl,
      type: 'text/css; charset=UTF-8',
      value: loadFixtureBuffer(cssName),
    })

    const imgName = 'smurfs4.jpg'
    const imgUrl = `${baseUrl}/${imgName}`
    const imgResource = createResource({
      url: imgUrl,
      type: 'image/jpeg',
      value: loadFixtureBuffer(imgName),
    })

    const fontZillaName = 'zilla_slab.woff2'
    const fontZillaUrl = `${baseUrl}/${fontZillaName}`
    const fontZillaUrlResource = createResource({url: fontZillaUrl})
    const fontZillaResource = createResource({
      url: fontZillaUrl,
      type: 'font/woff2',
      value: loadFixtureBuffer(fontZillaName),
    })

    const resources = await processResources({
      resources: {
        [cssResource.url]: cssResource,
        [imgResource.url]: imgResource,
        [fontZillaResource.url]: fontZillaUrlResource,
      },
    })

    expect(resources.mapping).to.eql({
      [cssResource.url]: cssResource.hash,
      [imgResource.url]: imgResource.hash,
      [fontZillaResource.url]: fontZillaResource.hash,
    })
  })

  it("doesn't extract dependencies from prefilled resources", async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const cssName = 'hasDependency.css' // has smurfs4.jpg as dependecy
    const cssUrl = `${baseUrl}/${cssName}`
    const cssResource = createResource({
      url: cssUrl,
      type: 'text/css; charset=UTF-8',
      value: loadFixtureBuffer(cssName),
    })

    const resources = await processResources({
      resources: {[cssUrl]: cssResource},
    })

    expect(resources.mapping).to.eql({[cssUrl]: cssResource.hash})
  })

  // TODO enable this
  it.skip('works for unknown content-type', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const fileName = 'no-content-type'
    const fileUrl = `${baseUrl}/${fileName}`
    const fileResource = createResource({
      url: fileUrl,
      type: 'application/x-applitools-unknown',
      value: loadFixtureBuffer(fileName),
    })

    const resources = await processResources({
      resources: {[fileUrl]: createResource({url: fileUrl})},
    })

    expect(resources.mapping).to.eql({[fileUrl]: fileResource.hash})

    const resourcesFromCache = await processResources({
      resources: {[fileUrl]: createResource({url: fileUrl})},
    })

    expect(resourcesFromCache.mapping).to.deep.equal(resources.mapping)
  })

  it("doesn't fail when fetch fails, but write a log", async () => {
    let output = ''
    const processResources = makeProcessResources({
      fetchResource,
      putResources,
      logger: {
        log: (...args) => void (output += args.join('')),
      },
    })

    const url = 'http://localhost:1234/err/bla.css'
    const resources = await processResources({resources: {[url]: createResource({url})}})
    expect(resources.mapping).to.eql({[url]: createResource({url, errorStatusCode: 504}).hash})
    expect(output).to.contain(
      'error fetching resource at http://localhost:1234/err/bla.css, setting errorStatusCode to 504',
    )
  })

  it('handles the case when the same resource appears as prefilled resource and as a dependency of another url resource', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const preResource = createResource({
      url: `${baseUrl}/smurfs.jpg`,
      type: 'bla-type',
      value: 'bla-content',
    })
    const cssName = 'single-resource.css'
    const cssUrl = `${baseUrl}/${cssName}`
    const cssResource = createResource({
      url: cssUrl,
      type: 'text/css; charset=UTF-8',
      value: loadFixtureBuffer(cssName),
    })
    const urlCssResource = createResource({url: cssUrl})

    const resources = await processResources({
      resources: {[preResource.url]: preResource, [urlCssResource.url]: urlCssResource},
    })
    expect(resources.mapping).to.eql({
      [preResource.url]: preResource.hash,
      [cssResource.url]: cssResource.hash,
    })
  })

  it('handles the case when the same resource appears both in prefilled resource and as a dependency of another prefilled resource', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const jpgResource = createResource({
      url: `${baseUrl}/smurfs.jpg`,
      type: 'bla-type',
      value: 'bla-content',
    })
    const cssName = 'single-resource.css'
    const cssResource = createResource({
      url: `${baseUrl}/${cssName}`,
      type: 'text/css; charset=UTF-8',
      value: loadFixtureBuffer(cssName),
    })

    const resources = await processResources({
      resources: {
        [jpgResource.url]: jpgResource,
        [cssResource.url]: cssResource,
      },
    })
    expect(resources.mapping).to.eql({
      [jpgResource.url]: jpgResource.hash,
      [cssResource.url]: cssResource.hash,
    })
  })

  it('handles recursive reference inside a dependency', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const cssName = 'recursive.css'
    const cssUrl = `${baseUrl}/${cssName}`
    const cssResource = createResource({
      url: cssUrl,
      type: 'text/css; charset=UTF-8',
      value: loadFixtureBuffer(cssName),
    })
    const resources = await processResources({
      resources: {[cssResource.url]: createResource({url: cssResource.url})},
    })

    expect(resources.mapping).to.eql({[cssResource.url]: cssResource.hash})
  })

  it('handles recursive reference inside a dependency from a prefilled resource', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const cssName = 'recursive.css'
    const cssUrl = `${baseUrl}/${cssName}`
    const cssResource = createResource({
      url: cssUrl,
      type: 'text/css; charset=UTF-8',
      value: loadFixtureBuffer(cssName),
    })
    const resources = await processResources({
      resources: {[cssResource.url]: cssResource},
    })

    expect(resources.mapping).to.eql({[cssResource.url]: cssResource.hash})
  })

  it('handles mutually recursive references', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const css1Name = 'recursive-1.css'
    const css1Url = `${baseUrl}/${css1Name}`
    const css1Resource = createResource({
      url: css1Url,
      type: 'text/css; charset=UTF-8',
      value: loadFixtureBuffer(css1Name),
    })
    const css2Name = 'recursive-2.css'
    const css2Url = `${baseUrl}/${css2Name}`
    const css2Resource = createResource({
      url: css2Url,
      type: 'text/css; charset=UTF-8',
      value: loadFixtureBuffer(css2Name),
    })

    const resources = await processResources({
      resources: {[css1Resource.url]: createResource({url: css1Resource.url})},
    })

    expect(resources.mapping).to.eql({
      [css1Resource.url]: css1Resource.hash,
      [css2Resource.url]: css2Resource.hash,
    })
  })

  it('make sure we send user agent when fetching google fonts', async () => {
    const fetchResource = makeFetchResource({
      async fetch(_url, options) {
        return {
          ok: true,
          buffer: async () => 'font',
          headers: new Map([['Content-Type', `application/${options.headers['User-Agent']}`]]),
        }
      },
      logger,
    })

    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const googleFontUrl = 'https://fonts.googleapis.com/css?family=Zilla+Slab'

    const resources = await processResources({
      resources: {[googleFontUrl]: createResource({url: googleFontUrl, browserName: 'ie11'})},
    })

    expect(resources.mapping[googleFontUrl].contentType).to.eql(
      `application/Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko`,
    )
  })

  it('handles resources with errorStatusCode (non-200 resources) from prefilled resources', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const resource = createResource({url: 'http://resource-1', errorStatusCode: 500})

    const resources = await processResources({resources: {[resource.url]: resource}})
    expect(resources.mapping).to.eql({[resource.url]: resource.hash})
  })

  it('handles resources with errorStatusCode (non-200 resources) from url resources', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const resource = createResource({url: `${baseUrl}/predefined-status/401`, errorStatusCode: 401})

    const resources = await processResources({
      resources: {[resource.url]: createResource({url: resource.url})},
    })
    expect(resources.mapping).to.eql({[resource.url]: resource.hash})
  })

  it('handles resources with errorStatusCode (non-200 resources) from cache', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const resource = createResource({url: 'http://resource-1', errorStatusCode: 500})

    await processResources({resources: {[resource.url]: resource}})

    const resources = await processResources({
      resources: {[resource.url]: createResource({url: resource.url})},
    })
    expect(resources.mapping).to.eql({[resource.url]: resource.hash})
  })

  it('handles prefilled resources with dependencies', async () => {
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    const resource1 = createResource({
      url: 'http://resource-1',
      type: 'type1',
      value: 'content1',
      dependencies: ['http://resource-2'],
    })
    const resource2 = createResource({url: 'http://resource-2', type: 'type2', value: 'content2'})

    const resources = await processResources({
      resources: {[resource1.url]: resource1, [resource2.url]: resource2},
    })

    const expected = {[resource1.url]: resource1.hash, [resource2.url]: resource2.hash}

    expect(resources.mapping).to.eql(expected)

    const resourcesFromCache = await processResources({
      resources: {[resource1.url]: createResource({url: resource1.url})},
    })

    expect(resourcesFromCache.mapping).to.eql(expected)
  })

  it('handles cookies', async () => {
    const results = []
    const fetchResource = makeFetchResource({
      async fetch(url, options) {
        results.push({url, cookie: options.headers.Cookie})
        return {
          ok: true,
          buffer: async () => 'content',
          headers: new Map([['Content-Type', `text/plain`]]),
        }
      },
      logger,
    })
    const processResources = makeProcessResources({fetchResource, putResources, logger})

    await processResources({
      resources: {
        'http://some-url.com/images/image.png': createResource({
          url: 'http://some-url.com/images/image.png',
        }),
        'http://some-other-url.com/pictures/picture.jpeg': createResource({
          url: 'http://some-other-url.com/pictures/picture.jpeg',
        }),
        'http://my-domain.com/static/style.css': createResource({
          url: 'http://my-domain.com/static/style.css',
        }),
        'http://web.theweb.com/resources/resource.css': createResource({
          url: 'http://web.theweb.com/resources/resource.css',
        }),
        'http://theinternet.com/assets/public/img.png': createResource({
          url: 'http://theinternet.com/assets/public/img.png',
        }),
      },
      cookies: [
        {
          domain: 'some-other-url.com',
          path: '/pictures',
          name: 'hello',
          value: 'world',
          expiry: Date.now() / 1000 - 1,
        },
        {
          domain: '.theweb.com',
          path: '/resources/',
          name: 'resource',
          value: 'alright',
        },
        {domain: 'some-url.com', path: '/images', name: 'hello', value: 'world'},
        {domain: 'my-domain.com', path: '/static', name: 'static', value: 'yes', secure: true},
        {domain: 'theinternet.com', path: '/assets/public', name: 'assets', value: 'okay'},
      ],
    })

    expect(results).to.deep.equal([
      {url: 'http://some-url.com/images/image.png', cookie: 'hello=world;'},
      {url: 'http://some-other-url.com/pictures/picture.jpeg', cookie: ''}, // expired
      {url: 'http://my-domain.com/static/style.css', cookie: ''}, // non secure (http)
      {url: 'http://web.theweb.com/resources/resource.css', cookie: 'resource=alright;'},
      {url: 'http://theinternet.com/assets/public/img.png', cookie: 'assets=okay;'},
    ])
  })

  it('handles google fonts with cache', async () => {
    nock('https://fonts.googleapis.com')
      .get('/some-font')
      .once()
      .reply(function() {
        return [200, 'font', {'Content-Type': `application/${this.req.headers['user-agent']}`}]
      })

    nock('http://bla')
      .get('/some-resource')
      .once()
      .reply(function() {
        return [200, 'data', {'Content-Type': `application/${this.req.headers['user-agent']}`}]
      })

    const resourceCache = new Map()
    const processResources = makeProcessResources({
      fetchResource,
      putResources,
      resourceCache,
      logger,
    })

    const googleFontResource = createResource({
      url: 'https://fonts.googleapis.com/some-font',
      browserName: 'ie11',
    })
    const standardResource = createResource({url: 'http://bla/some-resource', browserName: 'ie11'})
    const mainUserAgent = 'main user agent'

    const resources = await processResources({
      resources: {
        [googleFontResource.url]: googleFontResource,
        [standardResource.url]: standardResource,
      },
      userAgent: mainUserAgent,
    })

    expect(resources.mapping[googleFontResource.url].contentType).to.equal(
      `application/Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko`,
    )
    expect(resources.mapping[standardResource.url].contentType).to.equal(
      `application/${mainUserAgent}`,
    )

    const resourcesFromCache = await processResources({
      resources: {
        [googleFontResource.url]: googleFontResource,
        [standardResource.url]: standardResource,
      },
      userAgent: mainUserAgent,
    })

    expect(resourcesFromCache.mapping[googleFontResource.url].contentType).to.equal(
      `application/Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko`,
    )
    expect(resourcesFromCache.mapping[standardResource.url].contentType).to.equal(
      `application/${mainUserAgent}`,
    )

    expect([...resourceCache.keys()]).to.eql([`${googleFontResource.url}~IE`, standardResource.url])
  })
})
