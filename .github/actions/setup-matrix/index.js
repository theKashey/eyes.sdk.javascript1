const core = require('@actions/core')

const SDK_ALIAS = {
  'playwright': ['eyes-playwright', '@applitools/eyes-playwright'],
  'puppeteer': ['pptr', 'eyes-puppeteer', '@applitools/eyes-puppeteer'],
  'webdriverio': ['wdio', 'eyes-webdriverio-5', 'eyes-webdriverio', '@applitools/eyes-webdriverio'],
  'webdriverio-legacy': ['wdio-legacy', 'eyes-webdriverio-4', 'eyes.webdriverio', '@applitools/eyes.webdriverio'],
  'selenium': ['eyes-selenium', '@applitools/eyes-selenium'],
  'protractor': ['eyes-protractor', '@applitools/eyes-protractor'],
  'nightwatch': ['eyes-nightwatch', '@applitools/eyes-nightwatch'],
  'testcafe': ['eyes-testcafe', '@applitools/eyes-testcafe'],
}

const DIR_NAME = {
  'playwright': 'eyes-playwright',
  'puppeteer': 'eyes-puppeteer',
  'webdriverio': 'eyes-webdriverio-5',
  'webdriverio-legacy': 'eyes-webdriverio-4',
  'selenium': 'eyes-selenium',
  'protractor': 'eyes-protractor',
  'nightwatch': 'eyes-nightwatch',
  'testcafe': 'eyes-testcafe',
}

const FRAMEWORK_NAME = {
  'playwright': 'playwright',
  'puppeteer': 'puppeteer',
  'webdriverio': 'webdriverio',
  'webdriverio-legacy': 'webdriverio',
  'selenium': 'selenium-webdriver',
  'protractor': 'protractor',
  'nightwatch': 'nightwatch',
  'testcafe': 'testcafe',
}

const sdks = core.getInput('sdks', {required: true})
const allowModifiers = core.getInput('allow-modifiers')

const include = sdks.split(/[\s,]+/).reduce((output, sdk) => {
  const [_, name, version, protocol] = sdk.match(/^(.*?)(?:@([\d.]+))?(?::(.+?))?$/i)
  if (!allowModifiers && (version | protocol)) {
    console.warn(`Modifiers are not allowed! SDK configured as "${sdk}" will be skipped!`)
    return output
  }
  const package = Object.keys(SDK_ALIAS).find(dirname => dirname === name || SDK_ALIAS[dirname].includes(name))
  if (!package) {
    console.warn(`Package name is unknown! SDK configured as "${sdk}" will be skipped!`)
    return output
  }
  const modifiers = Object.entries({version, protocol})
    .reduce((parts, [key, value]) => value ? [...parts, `${key}: ${value}`] : parts, [])
    .join('; ')
  output.push({
    name: `${package} ${modifiers ? `(${modifiers})` : ''}`,
    sdk: DIR_NAME[package],
    install: version ? `${FRAMEWORK_NAME[package]}@${version}` : '',
    env: {
      [`APPLITOOLS_${package.toUpperCase()}_MAJOR_VERSION`]: version,
      [`APPLITOOLS_${package.toUpperCase()}_PROTOCOL`]: protocol
    },
  })
  return output
}, [])

core.setOutput('matrix', {include})