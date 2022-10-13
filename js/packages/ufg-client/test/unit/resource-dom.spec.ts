import {makeResourceDom} from '../../src/resources/resource-dom'
import assert from 'assert'

describe('resource-dom', () => {
  it('sets content', () => {
    const domResource = makeResourceDom({cdt: 'cdt', resources: {'http://resource.com': 'hash'}})
    assert.strictEqual(
      domResource.value.toString(),
      JSON.stringify({resources: {'http://resource.com': 'hash'}, domNodes: 'cdt'}),
    )
  })

  it('sorts resources by key', () => {
    const domResource1 = makeResourceDom({
      cdt: 'cdt',
      resources: {
        'http://resource.com/4': 'hash1',
        'http://resource.com/3': 'hash2',
        'http://resource.com/2': 'hash3',
        'http://resource.com/1': 'hash4',
      },
    })
    assert.strictEqual(
      domResource1.value.toString(),
      JSON.stringify({
        resources: {
          'http://resource.com/1': 'hash4',
          'http://resource.com/2': 'hash3',
          'http://resource.com/3': 'hash2',
          'http://resource.com/4': 'hash1',
        },
        domNodes: 'cdt',
      }),
    )

    // different order, should produce the same sha
    const domResource2 = makeResourceDom({
      cdt: 'cdt',
      resources: {
        'http://resource.com/1': 'hash4',
        'http://resource.com/4': 'hash1',
        'http://resource.com/2': 'hash3',
        'http://resource.com/3': 'hash2',
      },
    })
    assert.deepStrictEqual(domResource2.hash, domResource1.hash)
  })
})
