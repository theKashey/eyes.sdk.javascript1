import assert from 'assert'
import {parseUserAgent} from '../../src/user-agent'

describe('user agent', () => {
  it('should return Chrome as browser, Windows as OS', () => {
    const userAgent = parseUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36',
    )
    assert.deepStrictEqual(userAgent, {
      platformName: 'Windows',
      platformVersion: '10',
      browserName: 'Chrome',
      browserVersion: '60',
    })
  })

  it('should return Firefox as browser, Windows as OS', () => {
    const userAgent = parseUserAgent('Mozilla/5.0 (Windows NT 10.0; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0')
    assert.deepStrictEqual(userAgent, {
      platformName: 'Windows',
      platformVersion: '10',
      browserName: 'Firefox',
      browserVersion: '54',
    })
  })

  it('should return Chrome as browser, Android as OS', () => {
    const userAgent = parseUserAgent(
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Mobile Safari/537.36',
    )
    assert.deepStrictEqual(userAgent, {
      platformName: 'Android',
      platformVersion: '6',
      browserName: 'Chrome',
      browserVersion: '60',
    })
  })

  it('should return Safari as browser, iOS as OS', () => {
    const userAgent = parseUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1',
    )
    assert.deepStrictEqual(userAgent, {
      platformName: 'iOS',
      platformVersion: '10',
      browserName: 'Safari',
      browserVersion: '602',
    })
  })

  it('should return Chrome as browser, Linux as OS', () => {
    const userAgent = parseUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36 OPR/38.0.2220.41',
    )
    assert.deepStrictEqual(userAgent, {
      platformName: 'Linux',
      platformVersion: undefined,
      browserName: 'Chrome',
      browserVersion: '51',
    })
  })

  it('should return Edge as browser, Windows as OS', () => {
    const userAgent = parseUserAgent(
      'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10136',
    )
    assert.deepStrictEqual(userAgent, {
      platformName: 'Windows',
      platformVersion: '10',
      browserName: 'Edge',
      browserVersion: '12',
    })
  })

  it('should return IE as browser, Windows as OS', () => {
    const userAgent = parseUserAgent(
      'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)',
    )
    assert.deepStrictEqual(userAgent, {
      platformName: 'Windows',
      platformVersion: undefined,
      browserName: 'IE',
      browserVersion: '9',
    })
  })

  it('should return hidden IE as browser, Windows as OS', () => {
    const userAgent = parseUserAgent('Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko')
    assert.deepStrictEqual(userAgent, {
      platformName: 'Windows',
      platformVersion: '8',
      browserName: 'IE',
      browserVersion: '11',
    })
  })

  it('should return Unknown as browser, Unknown as OS', () => {
    const userAgent = parseUserAgent('Googlebot/2.1 (+http://www.google.com/bot.html)')
    assert.deepStrictEqual(userAgent, {
      platformName: 'Unknown',
      browserName: 'Unknown',
    })
  })

  it('should return Safari as browser, Mac OS X as OS', () => {
    const userAgent = parseUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0.1 Safari/604.3.5',
    )
    assert.deepStrictEqual(userAgent, {
      platformName: 'Mac OS X',
      platformVersion: '10',
      browserName: 'Safari',
      browserVersion: '11',
    })
  })
  ;[
    {
      uaStr:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
      platformName: 'Windows',
      platformVersion: '10',
      browserName: 'Chrome',
      browserVersion: '75',
    },
    {
      uaStr:
        'Mozilla/5.0 (Linux; Android 9; Android SDK built for x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.105 Mobile Safari/537.36',
      platformName: 'Android',
      platformVersion: '9',
      browserName: 'Chrome',
      browserVersion: '72',
    },
    {
      uaStr: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0',
      platformName: 'Windows',
      platformVersion: '7',
      browserName: 'Firefox',
      browserVersion: '54',
    },
    {
      uaStr: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
      platformName: 'Windows',
      platformVersion: '7',
      browserName: 'IE',
      browserVersion: '11',
    },
    {
      uaStr: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)',
      platformName: 'Windows',
      platformVersion: '7',
      browserName: 'IE',
      browserVersion: '10',
    },
    {
      uaStr:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/74.0.3729.157 Safari/537.36',
      platformName: 'Linux',
      platformVersion: undefined,
      browserName: 'Chrome',
      browserVersion: '74',
    },
    {
      uaStr: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:50.0) Gecko/20100101 Firefox/50.0',
      platformName: 'Linux',
      platformVersion: undefined,
      browserName: 'Firefox',
      browserVersion: '50',
    },
    {
      uaStr:
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-J700M Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
      platformName: 'Android',
      platformVersion: '6',
      browserName: 'Chrome',
      browserVersion: '69',
    },
    {
      uaStr:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
      platformName: 'iOS',
      platformVersion: '12',
      browserName: 'Safari',
      browserVersion: '12',
    },
    {
      uaStr:
        'Mozilla/5.0 (iPad; CPU OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1',
      platformName: 'iOS',
      platformVersion: '11',
      browserName: 'Safari',
      browserVersion: '11',
    },
    {
      uaStr:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15',
      platformName: 'Mac OS X',
      platformVersion: '10',
      browserName: 'Safari',
      browserVersion: '12',
    },
    {
      uaStr:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
      platformName: 'Windows',
      platformVersion: '10',
      browserName: 'Chrome',
      browserVersion: '74',
    },
    {
      uaStr: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36',
      platformName: 'Windows',
      platformVersion: '7',
      browserName: 'Chrome',
      browserVersion: '33',
    },
    {
      uaStr:
        'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
      platformName: 'Windows',
      platformVersion: '8',
      browserName: 'Chrome',
      browserVersion: '60',
    },
    /*
       {
       uaStr: 'Mozilla/5.0 (Linux; U; Android 4.2.2; en-us; GT-I9100 Build/JDQ39E) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 CyanogenMod/10.1.3/i9100',
       platformName: 'Android',
       platformVersion: '4',
       browserName: BrowserNames.AndroidBrowser,
       browserVersion: '4',
       },
       {
       uaStr: 'Mozilla/4.0 (compatible; MSIE 7.0b; Windows NT 6.0)',
       platformName: 'Windows',
       platformVersion: '6',
       browserName: 'IE',
       browserVersion: '7',
       },
       */
    {
      uaStr:
        'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25',
      platformName: 'iOS',
      platformVersion: '6',
      browserName: 'Safari',
      browserVersion: '6',
    },
    {
      uaStr:
        'Mozilla/5.0 (iPad; CPU OS 5_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko ) Version/5.1 Mobile/9B176 Safari/7534.48.3',
      platformName: 'iOS',
      platformVersion: '5',
      browserName: 'Safari',
      browserVersion: '5',
    },
    {
      uaStr:
        'Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_3 like Mac OS X; ja-jp) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5',
      platformName: 'iOS',
      platformVersion: '4',
      browserName: 'Safari',
      browserVersion: '5',
    },
    {
      uaStr:
        'Mozilla/5.0 (iPhone Simulator; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7D11 Safari/531.21.10',
      platformName: 'iOS',
      platformVersion: '3',
      browserName: 'Safari',
      browserVersion: '4',
    },
    {
      uaStr: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0',
      platformName: 'Windows',
      platformVersion: '7',
      browserName: 'Firefox',
      browserVersion: '54',
    },
    {
      uaStr: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
      platformName: 'Windows',
      platformVersion: '7',
      browserName: 'IE',
      browserVersion: '11',
    },
    {
      uaStr: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)',
      platformName: 'Windows',
      platformVersion: '7',
      browserName: 'IE',
      browserVersion: '10',
    },
    {
      uaStr:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/74.0.3729.157 Safari/537.36',
      platformName: 'Linux',
      platformVersion: undefined,
      browserName: 'Chrome',
      browserVersion: '74',
    },
    {
      uaStr: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:50.0) Gecko/20100101 Firefox/50.0',
      platformName: 'Linux',
      platformVersion: undefined,
      browserName: 'Firefox',
      browserVersion: '50',
    },
    {
      uaStr:
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-J700M Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
      platformName: 'Android',
      platformVersion: '6',
      browserName: 'Chrome',
      browserVersion: '69',
    },
    {
      uaStr:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
      platformName: 'iOS',
      platformVersion: '12',
      browserName: 'Safari',
      browserVersion: '12',
    },
    {
      uaStr:
        'Mozilla/5.0 (iPad; CPU OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1',
      platformName: 'iOS',
      platformVersion: '11',
      browserName: 'Safari',
      browserVersion: '11',
    },
    {
      uaStr:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15',
      platformName: 'Mac OS X',
      platformVersion: '10',
      browserName: 'Safari',
      browserVersion: '12',
    },
    {
      uaStr:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.29 Safari/537.36 Edg/79.0.309.18',
      platformName: 'Mac OS X',
      platformVersion: '10',
      browserName: 'Edge',
      browserVersion: '79',
    },
  ].forEach(({uaStr, ...expected}) => {
    it(`should parse ${uaStr}`, () => {
      const userAgent = parseUserAgent(uaStr)
      assert.deepStrictEqual(userAgent, expected)
    })
  })
})
