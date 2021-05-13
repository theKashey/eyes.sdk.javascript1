const core = require('@actions/core')

const PACKAGES = [
  {name: 'utils', dirname: 'utils', aliases: ['@applitools/utils']},
  {name: 'snippets', dirname: 'snippets', aliases: ['@applitools/snippets']},
  {name: 'logger', dirname: 'logger', aliases: ['@applitools/logger']},
  {name: 'screenshoter', dirname: 'screenshoter', aliases: ['@applitools/screenshoter']},
  {name: 'driver', dirname: 'driver', aliases: ['@applitools/driver']},
  {name: 'api', dirname: 'eyes-api', aliases: ['@applitools/eyes-api']},
  {name: 'core', dirname: 'eyes-sdk-core', aliases: ['@applitools/eyes-sdk-core']},
  {name: 'vgc', dirname: 'visual-grid-client', aliases: ['@applitools/visual-grid-client']},

  {name: 'playwright', dirname: 'eyes-playwright', framework: 'playwright', sdk: true, aliases: ['@applitools/eyes-playwright']},
  {name: 'puppeteer', dirname: 'eyes-puppeteer', framework: 'puppeteer', sdk: true, aliases: ['pptr', '@applitools/eyes-puppeteer']},
  {name: 'webdriverio', dirname: 'eyes-webdriverio-5', framework: 'webdriverio', sdk: true, aliases: ['wdio', 'eyes-webdriverio', '@applitools/eyes-webdriverio']},
  {name: 'webdriverio-legacy', dirname: 'eyes-webdriverio-4', framework: 'webdriverio', sdk: true, aliases: ['wdio-legacy', 'eyes.webdriverio', '@applitools/eyes.webdriverio']},
  {name: 'selenium', dirname: 'eyes-selenium', framework: 'selenium-webdriver', sdk: true, aliases: ['@applitools/eyes-selenium']},
  {name: 'protractor', dirname: 'eyes-protractor', framework: 'protractor', sdk: true, aliases: ['@applitools/eyes-protractor']},
  {name: 'nightwatch', dirname: 'eyes-nightwatch', framework: 'nightwatch', sdk: true, aliases: ['@applitools/eyes-nightwatch']},
  {name: 'testcafe', dirname: 'eyes-testcafe', framework: 'testcafe', sdk: true, aliases: ['@applitools/eyes-testcafe']},
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
    if (!packageInfo.sdk && (frameworkVersion | frameworkProtocol)) {
      console.warn(`Framework modifiers are not allowed for package "${packageInfo.name}"! Package configured as "${packageSetting}" will be ignored!`)
      return packages
    }
  } else {
    if (frameworkVersion | frameworkProtocol) {
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
  else packages[packages.name] = package

  return packages
}, allowVariations ? [] : {})

core.setOutput('packages', packages)