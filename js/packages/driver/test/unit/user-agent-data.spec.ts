import assert from 'assert'
import {parseUserAgentData} from '../../src/user-agent-data'

describe('user agent data', () => {
  it('should return Windows 7 as OS', () => {
    const userAgent = parseUserAgentData({
      brands: [
        {brand: 'Google Chrome', version: '107'},
        {brand: 'Chromium', version: '107'},
      ],
      platform: 'Windows',
      platformVersion: '0.1.0',
    })
    assert.deepStrictEqual(userAgent, {
      platformName: 'Windows',
      platformVersion: '7',
      browserName: 'Google Chrome',
      browserVersion: '107',
      deviceName: undefined,
      isChromium: true,
      isMobile: undefined,
    })
  })

  it('should return Windows 8 as OS', () => {
    const userAgent = parseUserAgentData({
      brands: [
        {brand: 'Google Chrome', version: '107'},
        {brand: 'Chromium', version: '107'},
      ],
      platform: 'Windows',
      platformVersion: '0.2.0',
    })
    assert.deepStrictEqual(userAgent, {
      platformName: 'Windows',
      platformVersion: '8',
      browserName: 'Google Chrome',
      browserVersion: '107',
      deviceName: undefined,
      isChromium: true,
      isMobile: undefined,
    })
  })

  it('should return Windows 8.1 as OS', () => {
    const userAgent = parseUserAgentData({
      brands: [
        {brand: 'Google Chrome', version: '107'},
        {brand: 'Chromium', version: '107'},
      ],
      platform: 'Windows',
      platformVersion: '0.3.0',
    })
    assert.deepStrictEqual(userAgent, {
      platformName: 'Windows',
      platformVersion: '8.1',
      browserName: 'Google Chrome',
      browserVersion: '107',
      deviceName: undefined,
      isChromium: true,
      isMobile: undefined,
    })
  })

  it('should return Windows 10 as OS', () => {
    const userAgent = parseUserAgentData({
      brands: [
        {brand: 'Google Chrome', version: '107'},
        {brand: 'Chromium', version: '107'},
      ],
      platform: 'Windows',
      platformVersion: '10.0.0',
    })
    assert.deepStrictEqual(userAgent, {
      platformName: 'Windows',
      platformVersion: '10',
      browserName: 'Google Chrome',
      browserVersion: '107',
      deviceName: undefined,
      isChromium: true,
      isMobile: undefined,
    })
  })

  it('should return Windows 11 as OS', () => {
    const userAgent = parseUserAgentData({
      brands: [
        {brand: 'Google Chrome', version: '107'},
        {brand: 'Chromium', version: '107'},
      ],
      platform: 'Windows',
      platformVersion: '15.0.0',
    })
    assert.deepStrictEqual(userAgent, {
      platformName: 'Windows',
      platformVersion: '11',
      browserName: 'Google Chrome',
      browserVersion: '107',
      deviceName: undefined,
      isChromium: true,
      isMobile: undefined,
    })
  })

  it('should return Mac OS X 12.5 as OS', () => {
    const userAgent = parseUserAgentData({
      brands: [
        {brand: 'Chromium', version: '107'},
        {brand: 'Google Chrome', version: '107'},
      ],
      platform: 'macOS',
      platformVersion: '12.5.0',
    })
    assert.deepStrictEqual(userAgent, {
      platformName: 'Mac OS X',
      platformVersion: '12.5',
      browserName: 'Google Chrome',
      browserVersion: '107',
      deviceName: undefined,
      isChromium: true,
      isMobile: undefined,
    })
  })
})
