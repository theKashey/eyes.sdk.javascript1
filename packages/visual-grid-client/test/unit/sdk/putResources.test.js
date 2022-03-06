/* eslint-disable node/no-unsupported-features/node-builtins */
const {expect} = require('chai')
const makePutResources = require('../../../src/sdk/resources/putResources')
const createResource = require('../../../src/sdk/resources/createResource')
const createDomResource = require('../../../src/sdk/resources/createDomResource')
const logger = require('../../util/testLogger')

describe('putResources', () => {
  function getKey(resource) {
    return `${resource.url || 'dom'}_${resource.hash.hash}`
  }

  it('works', async () => {
    const putCount = {}
    const checkCount = {}
    const putResources = makePutResources({
      doCheckResources: resources => {
        const result = resources.map(resource => {
          const key = getKey(resource)
          checkCount[key] = checkCount[key] ? checkCount[key] + 1 : 1
          return resource.url === 'url2'
        })
        return new Promise(resolve => queueMicrotask(() => resolve(result)))
      },
      doPutResource: async resource => {
        const key = getKey(resource)
        putCount[key] = putCount[key] ? putCount[key] + 1 : 1
        return new Promise(resolve => queueMicrotask(() => resolve(key)))
      },
      logger,
    })

    const resource1 = createResource({url: 'url1', value: 'content1'})
    const resource1Key = getKey(resource1)
    const resource2 = createResource({url: 'url2', value: 'content2'})
    const resource2Key = getKey(resource2)
    const resource3 = createResource({url: 'url3', value: 'content3'})
    const resource3Key = getKey(resource3)
    const domResource1 = createDomResource({
      cdt: 'cdt',
      resources: {[resource1.url]: resource1.hash, [resource2.url]: resource2.hash},
    })
    const domResource1Key = getKey(domResource1)
    const domResource2 = createDomResource({
      cdt: 'cdt',
      resources: {[resource1.url]: resource1.hash, [resource3.url]: resource3.hash},
    })
    const domResource2Key = getKey(domResource2)

    const [result1, result2] = await Promise.all([
      putResources([domResource1, resource1, resource2]),
      putResources([domResource2, resource2, resource3]),
    ])

    expect(result1).to.eql([domResource1Key, resource1Key, undefined])
    expect(result2).to.eql([domResource2Key, undefined, resource3Key])

    expect(checkCount).to.eql({
      [domResource1Key]: 1,
      [domResource2Key]: 1,
      [resource1Key]: 1,
      [resource2Key]: 1,
      [resource3Key]: 1,
    })

    expect(putCount).to.eql({
      [domResource1Key]: 1,
      [domResource2Key]: 1,
      [resource1Key]: 1,
      [resource3Key]: 1,
    })
  })

  it('adds resources from all resources - not just the dom', async () => {
    const putResources = makePutResources({
      doCheckResources: resources => Promise.resolve(Array(resources.length).fill(false)),
      doPutResource: resource =>
        new Promise(resolve => queueMicrotask(() => resolve(getKey(resource)))),
      logger,
    })

    const resource1 = createResource({url: 'url1', value: 'content1'})
    const resource2 = createResource({url: 'url2', value: 'content2'})
    const resource3 = createResource({url: 'url3', value: 'content3'})
    const domResource = createDomResource({
      cdt: 'cdt',
      resources: {[resource1.url]: resource1.hash, [resource2.url]: resource2.hash},
    })

    const result = await putResources([domResource, resource1, resource2, resource3])
    expect(result).to.eql([
      getKey(domResource),
      getKey(resource1),
      getKey(resource2),
      getKey(resource3),
    ])
  })

  it('sends one request for sequence of put resources', async () => {
    const putCount = new Map()

    const putResources = makePutResources({
      doCheckResources: resources => Promise.resolve(Array(resources.length).fill(false)),
      doPutResource: resource => {
        const key = getKey(resource)
        const date = Math.floor(Date.now() / 10)
        if (putCount.has(date)) putCount.get(date).push(key)
        else putCount.set(date, [key])
        return new Promise(resolve => queueMicrotask(() => resolve(key)))
      },
      timeout: 10,
      logger,
    })

    const resource1 = createResource({url: 'url1', value: 'content1'})
    const resource1Key = getKey(resource1)
    const resource2 = createResource({url: 'url2', value: 'content2'})
    const resource2Key = getKey(resource2)
    const resource3 = createResource({url: 'url3', value: 'content3'})
    const resource3Key = getKey(resource3)
    const domResource1 = createDomResource({
      cdt: 'cdt',
      resources: {[resource1.url]: resource1.hash, [resource2.url]: resource2.hash},
    })
    const domResource1Key = getKey(domResource1)
    const domResource2 = createDomResource({
      cdt: 'cdt',
      resources: {[resource1.url]: resource1.hash, [resource3.url]: resource3.hash},
    })
    const domResource2Key = getKey(domResource2)

    const puts = []
    puts.push(putResources([domResource1, resource1]))
    puts.push(putResources([domResource2, resource2]))
    await new Promise(r => setTimeout(r, 10))
    puts.push(putResources([domResource2, resource3]))
    await new Promise(r => setTimeout(r, 5))
    puts.push(putResources([domResource1, resource1, resource3]))

    await Promise.all(puts)

    const results = Array.from(putCount.values())

    expect(results.length).to.be.eql(2)
    expect(results[0]).to.be.eql([domResource1Key, resource1Key, domResource2Key, resource2Key])
    expect(results[1]).to.be.eql([resource3Key])
  })
})
