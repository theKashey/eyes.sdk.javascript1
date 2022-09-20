import {createCookieHeader} from '../../src/utils/create-cookie-header'
import assert from 'assert'

describe('create-cookie-header', () => {
  it('handles cookies per url', () => {
    const url = 'https://somedomain.com'
    const cookies = [
      {domain: 'somedomain.com', path: '/', name: 'hello', value: 'world'},
      {domain: 'someotherdomain.com', path: '/', name: 'goodbye', value: 'moon'},
    ]

    assert.strictEqual(createCookieHeader({url, cookies}), 'hello=world;')
  })

  it('handles cookies per path', () => {
    const url = 'https://somedomain.com/images/image.png'
    const cookies = [
      {domain: 'somedomain.com', path: '/images', name: 'hello', value: 'world'},
      {domain: 'someotherdomain.com', path: '/images', name: 'hello', value: 'world'},
      {domain: 'somedomain.com', path: '/images', name: 'goodbye', value: 'moon'},
    ]

    assert.strictEqual(createCookieHeader({url, cookies}), 'hello=world;goodbye=moon;')
  })

  it('handles subdomains', () => {
    const url = 'https://mydomain.somedomain.com/images/image.png'
    const cookies = [
      {domain: 'someotherdomain.com', path: '/images', name: 'hello', value: 'world'},
      {domain: '.somedomain.com', path: '/images', name: 'goodbye', value: 'moon'},
      {domain: 'somedomain.com', path: '/images', name: 'yes', value: 'sir'},
    ]

    assert.strictEqual(createCookieHeader({url, cookies}), 'goodbye=moon;')
    assert.strictEqual(
      createCookieHeader({
        url: 'https://domain.com',
        cookies: [{domain: '.domain.com', path: '/', name: 'sub', value: 'domain'}],
      }),
      'sub=domain;',
    )
  })

  it('handles secure cookies', () => {
    const url = 'http://somedomain.com/images/image.png'
    const cookies = [
      {domain: 'somedomain.com', path: '/images', name: 'goodbye', value: 'moon', secure: false},
      {domain: 'somedomain.com', path: '/images', name: 'yes', value: 'sir', secure: true},
    ]

    assert.strictEqual(createCookieHeader({url, cookies}), 'goodbye=moon;')
  })

  it('handles expired cookies', () => {
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

    assert.strictEqual(createCookieHeader({url, cookies}), 'goodbye=moon;')
  })
})
