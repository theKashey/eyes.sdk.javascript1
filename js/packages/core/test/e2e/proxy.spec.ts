import * as spec from '@applitools/spec-driver-webdriverio'
import {makeCore} from '../../src/index'
// import esniffer from 'esniffer'
// import {createCertificate} from 'pem'
// import assert from 'assert'

describe.skip('proxy', () => {
  let driver, destroyDriver, _proxy

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  beforeEach(async () => {
    // await new Promise(r => {
    //   createCertificate({days: 1, selfSigned: true}, (error, authority) => {
    //     const proxy = esniffer.createServer({secure: {cert: authority.certificate, key: authority.serviceKey}}).listen(8080)
    //     setTimeout(r, 5000)
    //   })
    // })
    // destroyProxy = () => proxy.close()
  })

  afterEach(async () => {
    // await destroyProxy?.()
  })

  it('ufg eyes works with proxy', async () => {
    // console.log('proxy', proxy._server.address())

    // proxy.intercept({phase: 'request'}, req => {
    //   console.log(req.url)
    // })

    await driver.url('https://applitools.com/helloworld')

    const core = makeCore({spec})
    const manager = await core.makeManager({type: 'ufg', concurrency: 5})
    const eyes = await manager.openEyes({
      target: driver,
      settings: {
        appName: 'js core',
        testName: `ufg works with proxy`,
        proxy: {url: `http://localhost:8080`},
        environment: {viewportSize: {width: 800, height: 600}},
      },
    })

    await eyes.check({settings: {fully: false}})

    await eyes.close({settings: {throwErr: true, updateBaselineIfNew: false}})
  })
})
