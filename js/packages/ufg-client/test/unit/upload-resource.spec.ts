import {type UFGRequests} from '../../src/server/requests'
import {makeUploadResource} from '../../src/upload-resource'
import {makeResource} from '../../src/resource'
import {makeResourceDom} from '../../src/resource-dom'
import * as utils from '@applitools/utils'
import assert from 'assert'

describe('upload-resource', () => {
  function getKey(resource) {
    return `${resource.url || 'dom'}_${resource.hash.hash}`
  }

  it('works', async () => {
    const putCount = {}
    const checkCount = {}
    const uploadResource = makeUploadResource({
      requests: {
        checkResources({resources}) {
          const result = resources.map(resource => {
            const key = getKey(resource)
            checkCount[key] = checkCount[key] ? checkCount[key] + 1 : 1
            return resource.url === 'url2'
          })
          return new Promise(resolve => queueMicrotask(() => resolve(result)))
        },
        uploadResource({resource}) {
          const key = getKey(resource)
          putCount[key] = putCount[key] ? putCount[key] + 1 : 1
          return new Promise(resolve => queueMicrotask(resolve))
        },
      } as UFGRequests,
    })

    const resource1 = makeResource({url: 'url1', value: Buffer.from('content1')})
    const resource1Key = getKey(resource1)
    const resource2 = makeResource({url: 'url2', value: Buffer.from('content2')})
    const resource2Key = getKey(resource2)
    const resource3 = makeResource({url: 'url3', value: Buffer.from('content3')})
    const resource3Key = getKey(resource3)
    const domResource1 = makeResourceDom({
      cdt: 'cdt',
      resources: {[resource1.url]: resource1.hash, [resource2.url]: resource2.hash},
    })
    const domResource1Key = getKey(domResource1)
    const domResource2 = makeResourceDom({
      cdt: 'cdt',
      resources: {[resource1.url]: resource1.hash, [resource3.url]: resource3.hash},
    })
    const domResource2Key = getKey(domResource2)

    await Promise.all([
      uploadResource({resource: domResource1}),
      uploadResource({resource: resource1}),
      uploadResource({resource: resource2}),
      uploadResource({resource: domResource2}),
      uploadResource({resource: resource2}),
      uploadResource({resource: resource3}),
    ])

    assert.deepStrictEqual(checkCount, {
      [domResource1Key]: 1,
      [domResource2Key]: 1,
      [resource1Key]: 1,
      [resource2Key]: 1,
      [resource3Key]: 1,
    })
    assert.deepStrictEqual(putCount, {
      [domResource1Key]: 1,
      [domResource2Key]: 1,
      [resource1Key]: 1,
      [resource3Key]: 1,
    })
  })

  it('batches multiple calls in one request', async () => {
    const uploadCount = new Map()

    const uploadResource = makeUploadResource({
      requests: {
        checkResources({resources}) {
          return Promise.resolve(Array(resources.length).fill(false))
        },
        uploadResource({resource}) {
          const key = getKey(resource)
          const date = Math.floor(Date.now() / 10)
          if (uploadCount.has(date)) uploadCount.get(date).push(key)
          else uploadCount.set(date, [key])
          return new Promise(resolve => queueMicrotask(resolve))
        },
      } as UFGRequests,
      batchingTimeout: 10,
    })

    const resource1 = makeResource({url: 'url1', value: Buffer.from('content1')})
    const resource1Key = getKey(resource1)
    const resource2 = makeResource({url: 'url2', value: Buffer.from('content2')})
    const resource2Key = getKey(resource2)
    const resource3 = makeResource({url: 'url3', value: Buffer.from('content3')})
    const resource3Key = getKey(resource3)
    const domResource1 = makeResourceDom({
      cdt: 'cdt',
      resources: {[resource1.url]: resource1.hash, [resource2.url]: resource2.hash},
    })
    const domResource1Key = getKey(domResource1)
    const domResource2 = makeResourceDom({
      cdt: 'cdt',
      resources: {[resource1.url]: resource1.hash, [resource3.url]: resource3.hash},
    })
    const domResource2Key = getKey(domResource2)

    const puts = [] as Promise<void>[]
    puts.push(uploadResource({resource: domResource1}), uploadResource({resource: resource1}))
    puts.push(uploadResource({resource: domResource2}), uploadResource({resource: resource2}))
    await utils.general.sleep(10)
    puts.push(uploadResource({resource: domResource2}), uploadResource({resource: resource3}))
    await utils.general.sleep(5)
    puts.push(
      uploadResource({resource: domResource1}),
      uploadResource({resource: resource1}),
      uploadResource({resource: resource3}),
    )

    await Promise.all(puts)

    const results = Array.from(uploadCount.values())

    assert.strictEqual(results.length, 2)
    assert.deepStrictEqual(results[0], [domResource1Key, resource1Key, domResource2Key, resource2Key])
    assert.deepStrictEqual(results[1], [resource3Key])
  })
})
