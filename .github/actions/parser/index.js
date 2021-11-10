const core = require('@actions/core')

const PACKAGES = [
  {name: 'types', dirname: 'types', aliases: ['@applitools/types']},
  {name: 'utils', dirname: 'utils', aliases: ['@applitools/utils']},
  {name: 'test-utils', dirname: 'test-utils', aliases: ['@applitools/test-utils']},
  {name: 'snippets', dirname: 'snippets', aliases: ['@applitools/snippets']},
  {name: 'logger', dirname: 'logger', aliases: ['@applitools/logger']},
  {name: 'screenshoter', dirname: 'screenshoter', aliases: ['@applitools/screenshoter']},
  {name: 'driver', dirname: 'driver', aliases: ['@applitools/driver']},
  {name: 'scripts', dirname: 'scripts', aliases: ['@applitools/scripts']},
  {name: 'test-server', dirname: 'test-server', aliases: ['@applitools/test-server']},
  {name: 'api', dirname: 'eyes-api', aliases: ['@applitools/eyes-api']},
  {name: 'core', dirname: 'eyes-sdk-core', aliases: ['@applitools/eyes-sdk-core']},
  {name: 'vgc', dirname: 'visual-grid-client', aliases: ['@applitools/visual-grid-client']},

  {name: 'spec-playwright', dirname: 'spec-driver-playwright', framework: 'playwright', aliases: ['@applitools/spec-driver-playwright']},
  {name: 'spec-puppeteer', dirname: 'spec-driver-puppeteer', framework: 'puppeteer', aliases: ['spec-pptr', '@applitools/spec-driver-puppeteer']},
  {name: 'spec-webdriverio', dirname: 'spec-driver-webdriverio', framework: 'webdriverio', aliases: ['spec-wdio', '@applitools/spec-driver-webdriverio']},
  {name: 'spec-selenium', dirname: 'spec-driver-selenium', framework: 'selenium-webdriver', aliases: ['@applitools/spec-driver-selenium']},

  {name: 'universal', dirname: 'eyes-universal', sdk: true, aliases: ['usdk', '@applitools/eyes-universal']},
  {name: 'playwright-universal', dirname: 'eyes-playwright-universal', framework: 'playwright', sdk: true, aliases: ['playwright/u', '@applitools/eyes-playwright']},
  {name: 'playwright', dirname: 'eyes-playwright', framework: 'playwright', sdk: true, aliases: ['@applitools/eyes-playwright']},
  {name: 'puppeteer', dirname: 'eyes-puppeteer', framework: 'puppeteer', sdk: true, aliases: ['pptr', '@applitools/eyes-puppeteer']},
  {name: 'webdriverio', dirname: 'eyes-webdriverio-5', framework: 'webdriverio', sdk: true, aliases: ['wdio', 'eyes-webdriverio', '@applitools/eyes-webdriverio']},
  {name: 'webdriverio-service', dirname: 'eyes-webdriverio-5-service', framework: 'webdriverio', sdk: true, aliases: ['wdio-service', 'eyes-webdriverio-service', '@applitools/eyes-webdriverio-service']},
  {name: 'webdriverio-legacy', dirname: 'eyes-webdriverio-4', framework: 'webdriverio', sdk: true, aliases: ['wdio-legacy', 'eyes.webdriverio', '@applitools/eyes.webdriverio']},
  {name: 'selenium', dirname: 'eyes-selenium', framework: 'selenium-webdriver', sdk: true, aliases: ['@applitools/eyes-selenium']},
  {name: 'selenium-universal', dirname: 'eyes-selenium-universal', framework: 'selenium-webdriver', sdk: true, aliases: ['selenium/u', '@applitools/eyes-selenium']},
  {name: 'protractor', dirname: 'eyes-protractor', framework: 'protractor', sdk: true, aliases: ['@applitools/eyes-protractor']},
  {name: 'nightwatch', dirname: 'eyes-nightwatch', framework: 'nightwatch', sdk: true, aliases: ['nw', '@applitools/eyes-nightwatch']},
  {name: 'testcafe', dirname: 'eyes-testcafe', framework: 'testcafe', sdk: true, aliases: ['@applitools/eyes-testcafe']},
  {name: 'browser-extension', dirname: 'eyes-browser-extension', sdk: true, aliases: ['extension', '@applitools/eyes-browser-extension']},
  {name: 'cypress', dirname: 'eyes-cypress', framework: 'cypress', sdk: true, aliases: ['cy', '@applitools/eyes-cypress']},
  {name: 'storybook', dirname: 'eyes-storybook', framework: 'storybook', sdk: true, aliases: ['@applitools/eyes-storybook']},
]

const packageSettings = core.getInput('packages', {required: true})
const allowVariations = core.getInput('allow-variations')
const defaultReleaseVersion = core.getInput('release-version')

const packages = packageSettings.split(/[\s,]+/).reduce((packages, packageSetting) => {
  const [_, packageKey, releaseVersion = defaultReleaseVersion, frameworkVersion, frameworkProtocol]
    = packageSetting.match(/^(.*?)(?::(patch|minor|major))?(?:@([\d.]+))?(?:\+(.+?))?$/i)

  const packageInfo = PACKAGES.find(({name, dirname, aliases}) => {
    return name === packageKey || dirname === packageKey || aliases.includes(packageKey)
  })

  if (!packageInfo) {
    console.warn(`Package name is unknown! Package configured as "${packageSetting}" will be ignored!`)
    return packages
  }
  if (allowVariations) {
    if (!packageInfo.framework && (frameworkVersion || frameworkProtocol)) {
      console.warn(`Framework modifiers are not allowed for package "${packageInfo.name}"! Package configured as "${packageSetting}" will be ignored!`)
      return packages
    }
  } else {
    if (frameworkVersion || frameworkProtocol) {
      console.warn(`Modifiers are not allowed! Package configured as "${packageSetting}" will be ignored!`)
      return packages
    }
  }


  const appendix = Object.entries({release: releaseVersion, version: frameworkVersion, protocol: frameworkProtocol})
    .reduce((parts, [key, value]) => value ? [...parts, `${key}: ${value}`] : parts, [])
    .join('; ')
  const package = {
    displayName: `${packageInfo.name} ${appendix ? `(${appendix})` : ''}`,
    name: packageInfo.name,
    package: packageInfo.dirname,
    sdk: packageInfo.sdk,
    install: frameworkVersion ? `${packageInfo.framework}@${frameworkVersion}` : '',
    releaseVersion,
    env: {
      [`APPLITOOLS_${packageInfo.name.toUpperCase()}_MAJOR_VERSION`]: frameworkVersion,
      [`APPLITOOLS_${packageInfo.name.toUpperCase()}_PROTOCOL`]: frameworkProtocol
    }
  }

  if (allowVariations) packages.push(package)
  else packages[package.name] = package

  console.log(JSON.stringify(packages, null, 2))

  return packages
}, allowVariations ? [] : {})

core.setOutput('packages', packages)