const SAUCE_SERVER_URL = 'https://ondemand.saucelabs.com:443/wd/hub'

const SAUCE_CREDENTIALS = {
  username: process.env.SAUCE_USERNAME,
  accessKey: process.env.SAUCE_ACCESS_KEY,
}
const PERFECTO_SERVER_URL = 'https://partners.perfectomobile.com/nexperience/perfectomobile/wd/hub'
const PERFECTO_ACCESS_KEY = process.env.PERFECTO_ACCESS_KEY

const DEVICES = {
  // ios
  'iPhone 13': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      w3c: {
        platformName: 'iOS',
        'appium:platformVersion': '15.0',
        'appium:deviceName': 'iPhone 13 Simulator',
      },
      legacy: {
        platformName: 'iOS',
        platformVersion: '15.0',
        deviceName: 'iPhone 13 Simulator',
      },
    },
    options: {
      appiumVersion: '1.22.0',
      ...SAUCE_CREDENTIALS,
    },
  },
  'iPhone 12': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      w3c: {
        platformName: 'iOS',
        'appium:platformVersion': '14.5',
        'appium:deviceName': 'iPhone 12 Simulator',
      },
      legacy: {
        platformName: 'iOS',
        platformVersion: '14.5',
        deviceName: 'iPhone 12 Simulator',
      },
    },
    options: {
      appiumVersion: '1.20.0',
      ...SAUCE_CREDENTIALS,
    },
  },
  // 'iPhone 12 UFG native': {
  //   type: 'sauce',
  //   url: SAUCE_NATIVE_SERVER_URL,
  //   capabilities: {
  //     deviceName: 'iPhone 12 Pro Simulator',
  //     platformName: 'iOS',
  //     platformVersion: '15.2',
  //     deviceOrientation: 'portrait',
  //     processArguments: {
  //       args: [],
  //       env: {
  //         DYLD_INSERT_LIBRARIES: '@executable_path/Frameworks/UFG_lib.xcframework/ios-arm64_x86_64-simulator/UFG_lib.framework/UFG_lib'
  //       }
  //     },
  //     ...SAUCE_CREDENTIALS,
  //   },
  // },
  'iPhone 11': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      w3c: {
        platformName: 'iOS',
        'appium:platformVersion': '13.0',
        'appium:deviceName': 'iPhone 11 Simulator',
      },
      legacy: {
        platformName: 'iOS',
        platformVersion: '13.0',
        deviceName: 'iPhone 11 Simulator',
      },
    },
    options: {
      appiumVersion: '1.15.0',
      ...SAUCE_CREDENTIALS,
    },
  },
  'iPhone 11 Pro Max': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      appiumVersion: '1.18.3',
      deviceName: 'iPhone 11 Pro Max Simulator',
      deviceOrientation: 'portrait',
      platformVersion: '14.0',
      platformName: 'iOS',
      ...SAUCE_CREDENTIALS,
    },
  },
  'iPhone 11 Pro': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      deviceName: 'iPhone 11 Pro Simulator',
      platformVersion: '13.4',
      platformName: 'iOS',
      ...SAUCE_CREDENTIALS,
    },
  },
  'iPhone X': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      w3c: {
        platformName: 'iOS',
        'appium:platformVersion': '12.0',
        'appium:deviceName': 'iPhone X Simulator',
      },
      legacy: {
        platformName: 'iOS',
        platformVersion: '12.0',
        deviceName: 'iPhone X Simulator',
      },
    },
    options: {
      appiumVersion: '1.9.1',
      ...SAUCE_CREDENTIALS,
    },
  },
  'iPhone XS': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      platformName: 'iOS',
      platformVersion: '13.0',
      appiumVersion: '1.19.2',
      deviceName: 'iPhone XS Simulator',
      ...SAUCE_CREDENTIALS,
    },
  },
  'iPhone 8': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      w3c: {
        platformName: 'iOS',
        'appium:platformVersion': '11.0',
        'appium:deviceName': 'iPhone 8 Simulator',
      },
      legacy: {
        platformName: 'iOS',
        platformVersion: '11.0',
        deviceName: 'iPhone 8 Simulator',
      },
    },
    options: {
      appiumVersion: '1.8.0',
      ...SAUCE_CREDENTIALS,
    },
  },
  'iPhone 5S': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      deviceName: 'iPhone 5s Simulator',
      platformVersion: '12.4',
      platformName: 'iOS',
      ...SAUCE_CREDENTIALS,
    },
  },
  'iPad (7th generation)': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      browserName: 'Safari',
      deviceName: 'iPad (7th generation) Simulator',
      deviceOrientation: 'portrait',
      platformVersion: '13.2',
      platformName: 'iOS',
      ...SAUCE_CREDENTIALS,
    },
  },
  'iPad Air': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      deviceName: 'iPad Air Simulator',
      platformVersion: '12.4',
      platformName: 'iOS',
      ...SAUCE_CREDENTIALS,
    },
  },

  'Pixel 3 XL': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      deviceName: 'Google Pixel 3 XL GoogleAPI Emulator',
      platformName: 'Android',
      platformVersion: '10.0',
      deviceOrientation: 'portrait',
      autoGrantPermissions: true,
      autoAcceptAlerts: true,
      ...SAUCE_CREDENTIALS,
    },
  },
  'Pixel 3 XL Local': {
    url: 'http://localhost:4723/wd/hub',
    capabilities: {
      deviceName: 'Google Pixel 3 XL GoogleAPI Emulator',
      platformName: 'Android',
      platformVersion: '11.0',
      deviceOrientation: 'portrait',
      autoGrantPermissions: true,
      autoAcceptAlerts: true,
    },
  },
  'Pixel 3a XL': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      w3c: {
        platformName: 'Android',
        'appium:platformVersion': '10.0',
        'appium:deviceName': 'Google Pixel 3a XL GoogleAPI Emulator',
      },
      legacy: {
        deviceName: 'Google Pixel 3a XL GoogleAPI Emulator',
        platformName: 'Android',
        platformVersion: '10.0',
      },
    },
    options: {
      appiumVersion: '1.20.2',
      ...SAUCE_CREDENTIALS,
    },
  },
  'Samsung Galaxy S8': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      browserName: '',
      name: 'Android Demo',
      platformName: 'Android',
      platformVersion: '7.0',
      appiumVersion: '1.9.1',
      deviceName: 'Samsung Galaxy S8 FHD GoogleAPI Emulator',
      automationName: 'uiautomator2',
      newCommandTimeout: 600,
      ...SAUCE_CREDENTIALS,
    },
  },
  'Android Emulator': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      deviceName: 'Android Emulator',
      platformName: 'Android',
      platformVersion: '6.0',
      clearSystemFiles: true,
      noReset: true,
      ...SAUCE_CREDENTIALS,
    },
  },

  'Android 8.0 Chrome Emulator': {
    type: 'local',
    capabilities: {
      browserName: 'chrome',
      'goog:chromeOptions': {
        mobileEmulation: {
          deviceMetrics: {width: 384, height: 512, pixelRatio: 2},
          userAgent:
            'Mozilla/5.0 (Linux; Android 8.0.0; Android SDK built for x86_64 Build/OSR1.180418.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        },
        args: ['hide-scrollbars'],
      },
    },
  },
  'Perfecto Android native': {
    url: PERFECTO_SERVER_URL,
    capabilities: {
      deviceName: '932AY05WL7',
      maxInstances: 1,
      autoLaunch: true,
      appPackage: 'com.applitools.helloworld.android',
      appActivity: '.MainActivity',
      app: 'PRIVATE:eyes-hello-world.apk',
      securityToken: PERFECTO_ACCESS_KEY,
    },
  },
  'Perfecto Android native (enableAppiumBehavior)': {
    url: PERFECTO_SERVER_URL,
    capabilities: {
      deviceName: '932AY05WL7',
      maxInstances: 1,
      autoLaunch: true,
      appPackage: 'com.applitools.helloworld.android',
      appActivity: '.MainActivity',
      app: 'PRIVATE:eyes-hello-world.apk',
      securityToken: PERFECTO_ACCESS_KEY,
      enableAppiumBehavior: true,
    },
  },
  'BrowserStack Google Pixel 2': {
    url: 'https://hub-cloud.browserstack.com/wd/hub',
    capabilities: {
      deviceName: 'Google Pixel 2',
      platformName: 'Android',
      platformVersion: '9.0',
      deviceOrientation: 'portrait',
      automationName: 'UiAutomator2',
      'bstack:options': {
        deviceName: 'Google Pixel 2',
        osVersion: '9.0',
        realMobile: 'true',
        local: 'false',
        userName: process.env.BROWSERSTACK_USERNAME,
        accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
      },
      userName: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
    },
  },
}

const BROWSERS = {
  // local
  firefox: {
    type: 'local',
    url: 'http://localhost:4445/wd/hub',
    capabilities: {
      browserName: 'firefox',
    },
  },
  chrome: {
    type: 'local',
    capabilities: {
      browserName: 'chrome',
    },
  },

  // sauce
  safari: {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      w3c: {
        browserName: 'safari',
        browserVersion: '14',
        platformName: 'macOS 11.00',
      },
      legacy: {
        browserName: 'safari',
        version: '14',
        platform: 'macOS 11.00',
      },
    },
    options: {
      name: 'Safari 14',
      ...SAUCE_CREDENTIALS,
    },
  },
  'chrome-mac': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      w3c: {
        browserName: 'chrome',
        browserVersion: '95',
        platformName: 'macOS 11.00',
      },
      legacy: {
        browserName: 'chrome',
        version: '95',
        platform: 'macOS 11.00',
      },
    },
    options: {
      name: 'Chrome Mac',
      ...SAUCE_CREDENTIALS,
    },
  },
  'firefox-mac': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      w3c: {
        browserName: 'firefox',
        browserVersion: '94',
        platformName: 'macOS 11.00',
      },
      legacy: {
        browserName: 'firefox',
        version: '94',
        platform: 'macOS 11.00',
      },
    },
    options: {
      name: 'Firefox Mac',
      ...SAUCE_CREDENTIALS,
    },
  },
  'chrome-win': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      w3c: {
        browserName: 'chrome',
        browserVersion: '95',
        platformName: 'Windows 10',
      },
      legacy: {
        browserName: 'chrome',
        version: '95',
        platform: 'Windows 10',
      },
    },
    options: {
      name: 'Chrome Windows',
      ...SAUCE_CREDENTIALS,
    },
  },
  'firefox-win': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      w3c: {
        browserName: 'firefox',
        browserVersion: '94',
        platformName: 'Windows 10',
      },
      legacy: {
        browserName: 'firefox',
        version: '94',
        platform: 'Windows 10',
      },
    },
    options: {
      name: 'Firefox Windows',
      ...SAUCE_CREDENTIALS,
    },
  },
  'edge-win': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      w3c: {
        browserName: 'MicrosoftEdge',
        browserVersion: '95',
        platformName: 'Windows 10',
      },
      legacy: {
        browserName: 'MicrosoftEdge',
        version: '95',
        platform: 'Windows 10',
      },
    },
    options: {
      name: 'Edge Windows',
      ...SAUCE_CREDENTIALS,
    },
  },

  // legacy
  'edge-18': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      browserName: 'MicrosoftEdge',
      browserVersion: '18.17763',
      platformName: 'Windows 10',
    },
    options: {
      name: 'Edge 18',
      avoidProxy: true,
      screenResolution: '1920x1080',
      ...SAUCE_CREDENTIALS,
    },
  },
  'ie-11': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      w3c: {
        browserName: 'internet explorer',
        browserVersion: '11.285',
        platformName: 'Windows 10',
      },
      legacy: {
        browserName: 'internet explorer',
        version: '11.285',
        platform: 'Windows 10',
      },
    },
    options: {
      name: 'IE 11',
      screenResolution: '1920x1080',
      ...SAUCE_CREDENTIALS,
    },
  },
  'safari-11': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      w3c: {
        browserName: 'safari',
        browserVersion: '11',
        platformName: 'macOS 10.13',
      },
      legacy: {
        browserName: 'safari',
        version: '11',
        platform: 'macOS 10.13',
      },
    },
    options: {
      name: 'Safari 11',
      seleniumVersion: '3.4.0',
      ...SAUCE_CREDENTIALS,
    },
  },
  'safari-12': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      w3c: {
        browserName: 'safari',
        browserVersion: '12.1',
        platformName: 'macOS 10.13',
      },
      legacy: {
        browserName: 'safari',
        version: '12.1',
        platform: 'macOS 10.13',
      },
    },
    options: {
      name: 'Safari 12',
      seleniumVersion: '3.4.0',
      ...SAUCE_CREDENTIALS,
    },
  },
  'firefox-48': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      legacy: {
        browserName: 'Firefox',
        platform: 'Windows 10',
        version: '48.0',
      },
    },
    options: {
      name: 'Firefox 48',
      ...SAUCE_CREDENTIALS,
    },
  },
}

function parseEnv(
  {browser, app, device, url, headless = !process.env.NO_HEADLESS, legacy, eg, injectUFGLib, ...options} = {},
  protocol = 'wd',
) {
  const env = {browser, device, headless, protocol, ...options}
  if (protocol === 'wd') {
    env.url = new URL(url || process.env.CVG_TESTS_WD_REMOTE || process.env.CVG_TESTS_REMOTE)
    if (env.desiredCapabilities) env.desiredCapabilities = {...env.desiredCapabilities}
    env.capabilities = {...env.capabilities}
    env.capabilities.browserName = browser || env.capabilities.browserName || ''
    const preset = DEVICES[device] || BROWSERS[browser]
    if (preset) {
      env.url = preset.url ? new URL(preset.url) : env.url
      env.capabilities = {
        ...env.capabilities,
        ...((legacy ? preset.capabilities.legacy : preset.capabilities.w3c) || preset.capabilities),
      }
      legacy = legacy || env.capabilities.deviceName || env.capabilities.platform || env.capabilities.version
      env.configurable = preset.type !== 'sauce'
      env.appium = Boolean(env.device)
      if (preset.type === 'sauce') {
        if (legacy) {
          env.options = env.capabilities = {...env.capabilities, ...preset.options}
        } else {
          env.options = env.capabilities['sauce:options'] = {...preset.options}
        }
      } else {
        env.options = preset.options || {}
      }
      if (env.orientation) {
        env.options.deviceOrientation = env.orientation
      }
    }
    if (app) {
      env.capabilities[legacy ? 'app' : 'appium:app'] = app
    }
    if (eg && (!preset || preset.type === 'local')) {
      env.url = new URL(process.env.CVG_TESTS_EG_REMOTE)
    }
    if (injectUFGLib) {
      env.capabilities['appium:processArguments'] = {
        args: [],
        env: {
          DYLD_INSERT_LIBRARIES:
            '@executable_path/Frameworks/UFG_lib.xcframework/ios-arm64_x86_64-simulator/UFG_lib.framework/UFG_lib',
        },
      }
    }
  } else if (protocol === 'cdp') {
    url = url || process.env.CVG_TESTS_CDP_REMOTE
    env.url = url ? new URL(url) : undefined
  }
  return env
}

module.exports = parseEnv
