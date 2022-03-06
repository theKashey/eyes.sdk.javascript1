const {expect} = require('chai')
const createDomResource = require('../../../src/sdk/resources/createDomResource')

describe('createDomResource', () => {
  it('sets content', () => {
    const domResource = createDomResource({cdt: 'cdt', resources: {'http://resource.com': 'hash'}})
    expect(domResource.value.toString()).to.eql(
      JSON.stringify({resources: {'http://resource.com': 'hash'}, domNodes: 'cdt'}),
    )
  })

  it('sorts resources by key', () => {
    const domResource = createDomResource({
      cdt: 'cdt',
      resources: {
        'http://resource.com/4': 'hash1',
        'http://resource.com/3': 'hash2',
        'http://resource.com/2': 'hash3',
        'http://resource.com/1': 'hash4',
      },
    })

    expect(domResource.value.toString()).to.eql(
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
    const domResource2 = createDomResource({
      cdt: 'cdt',
      resources: {
        'http://resource.com/1': 'hash4',
        'http://resource.com/4': 'hash1',
        'http://resource.com/2': 'hash3',
        'http://resource.com/3': 'hash2',
      },
    })
    expect(domResource2.hash).to.eql(domResource.hash)
  })
})
