const {expect} = require('chai')
const createResourceCookieHeader = require('../../../src/sdk/resources/createResourceCookieHeader')

describe('createResourceCookieHeader', () => {
  it('should handle cookies per url', () => {
    const url = 'https://somedomain.com'
    const cookies = [
      {domain: 'somedomain.com', path: '/', name: 'hello', value: 'world'},
      {domain: 'someotherdomain.com', path: '/', name: 'goodbye', value: 'moon'},
    ]

    expect(createResourceCookieHeader(url, cookies)).to.equal('hello=world;')
  })

  it('should handle cookies per path', () => {
    const url = 'https://somedomain.com/images/image.png'
    const cookies = [
      {domain: 'somedomain.com', path: '/images', name: 'hello', value: 'world'},
      {domain: 'someotherdomain.com', path: '/images', name: 'hello', value: 'world'},
      {domain: 'somedomain.com', path: '/images', name: 'goodbye', value: 'moon'},
    ]

    expect(createResourceCookieHeader(url, cookies)).to.equal('hello=world;goodbye=moon;')
  })

  it('should handle subdomains', () => {
    const url = 'https://mydomain.somedomain.com/images/image.png'
    const cookies = [
      {domain: 'someotherdomain.com', path: '/images', name: 'hello', value: 'world'},
      {domain: '.somedomain.com', path: '/images', name: 'goodbye', value: 'moon'},
      {domain: 'somedomain.com', path: '/images', name: 'yes', value: 'sir'},
    ]

    expect(createResourceCookieHeader(url, cookies)).to.equal('goodbye=moon;')
    expect(
      createResourceCookieHeader('https://domain.com', [
        {domain: '.domain.com', path: '/', name: 'sub', value: 'domain'},
      ]),
    ).to.equal('sub=domain;')
  })

  it('should handle secure cookies', () => {
    const url = 'http://somedomain.com/images/image.png'
    const cookies = [
      {domain: 'somedomain.com', path: '/images', name: 'goodbye', value: 'moon', secure: false},
      {domain: 'somedomain.com', path: '/images', name: 'yes', value: 'sir', secure: true},
    ]

    expect(createResourceCookieHeader(url, cookies)).to.equal('goodbye=moon;')
  })

  it('should handle expired cookies', () => {
    const url = 'http://somedomain.com/images/image.png'
    const cookies = [
      {domain: 'somedomain.com', path: '/images', name: 'goodbye', value: 'moon'},
      {
        domain: 'somedomain.com',
        path: '/images',
        name: 'yes',
        value: 'sir',
        expiry: new Date().getSeconds(),
      },
    ]

    expect(createResourceCookieHeader(url, cookies)).to.equal('goodbye=moon;')
  })
})
