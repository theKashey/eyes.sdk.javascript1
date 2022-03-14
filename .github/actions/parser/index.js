const core = require('@actions/core')

const PACKAGES = [
  // #region BASE
  {name: 'types', dirname: 'types', aliases: ['@applitools/types'], dependencies: []},
  {name: 'utils', dirname: 'utils', aliases: ['@applitools/utils'], dependencies: []},
  // #endregion

  // #region TEST BASE
  {name: 'test-utils', dirname: 'test-utils', aliases: ['@applitools/test-utils'], dependencies: []},
  {name: 'test-server', dirname: 'test-server', aliases: ['@applitools/test-server'], dependencies: ['utils']},
  // #endregion

  // #region TOOLING
  {name: 'scripts', dirname: 'scripts', aliases: ['@applitools/scripts'], dependencies: ['utils', 'test-utils']},
  {name: 'bongo', dirname: 'sdk-release-kit', aliases: ['@applitools/sdk-release-kit'], dependencies: ['utils']},
  // #endregion

  // #region MODULES
  {name: 'snippets', dirname: 'snippets', aliases: ['@applitools/snippets'], dependencies: []},
  {name: 'logger', dirname: 'logger', aliases: ['@applitools/logger'], dependencies: ['utils']},
  {name: 'screenshoter', dirname: 'screenshoter', aliases: ['@applitools/screenshoter'], dependencies: ['utils', 'driver', 'snippets', 'spec-webdriver']},
  {name: 'driver', dirname: 'driver', aliases: ['@applitools/driver'], dependencies: ['types', 'utils', 'snippets']},
  // #endregion
  
  // #region CORE
  {name: 'core', dirname: 'eyes-sdk-core', aliases: ['@applitools/eyes-sdk-core'], dependencies: ['types', 'utils', 'test-utils', 'logger', 'driver', 'screenshoter', 'snippets']},
  {name: 'vgc', dirname: 'visual-grid-client', aliases: ['@applitools/visual-grid-client'], dependencies: ['types', 'core']},
  {name: 'api', dirname: 'eyes-api', aliases: ['@applitools/eyes-api'], dependencies: ['types', 'utils', 'logger']},
  // #endregion

  // #region SPEC DRIVER
  {name: 'spec-playwright', dirname: 'spec-driver-playwright', framework: 'playwright', aliases: ['@applitools/spec-driver-playwright'], dependencies: ['types', 'utils', 'test-utils']},
  {name: 'spec-puppeteer', dirname: 'spec-driver-puppeteer', framework: 'puppeteer', aliases: ['spec-pptr', '@applitools/spec-driver-puppeteer'], dependencies: ['types', 'utils', 'test-utils']},
  {name: 'spec-webdriverio', dirname: 'spec-driver-webdriverio', framework: 'webdriverio', aliases: ['spec-wdio', '@applitools/spec-driver-webdriverio'], dependencies: ['types', 'utils', 'test-utils']},
  {name: 'spec-selenium', dirname: 'spec-driver-selenium', framework: 'selenium-webdriver', aliases: ['@applitools/spec-driver-selenium'], dependencies: ['types', 'utils', 'test-utils']},
  // #endregion

  // #region SDKS
  {name: 'universal', dirname: 'eyes-universal', sdk: true, aliases: ['usdk', '@applitools/eyes-universal'], dependencies: ['types', 'utils', 'logger', 'core', 'vgc']},
  {name: 'playwright-universal', dirname: 'eyes-playwright-universal', framework: 'playwright', sdk: true, aliases: ['playwright/u', '@applitools/eyes-playwright'], dependencies: ['spec-playwright', 'api', 'universal', 'test-utils']},
  {name: 'selenium-universal', dirname: 'eyes-selenium-universal', framework: 'selenium-webdriver', sdk: true, aliases: ['selenium/u', '@applitools/eyes-selenium'], dependencies: ['types', 'utils', 'test-utils', 'api', 'universal']},
  {name: 'playwright', dirname: 'eyes-playwright', framework: 'playwright', sdk: true, aliases: ['@applitools/eyes-playwright'], dependencies: ['spec-playwright', 'api', 'core', 'vgc', 'test-utils']},
  {name: 'puppeteer', dirname: 'eyes-puppeteer', framework: 'puppeteer', sdk: true, aliases: ['pptr', '@applitools/eyes-puppeteer'], dependencies: ['spec-puppeteer', 'api', 'core', 'vgc', 'test-utils']},
  {name: 'webdriverio', dirname: 'eyes-webdriverio-5', framework: 'webdriverio', sdk: true, aliases: ['wdio', 'eyes-webdriverio', '@applitools/eyes-webdriverio'], dependencies: ['spec-webdriverio', 'api', 'core', 'vgc', 'test-utils']},
  {name: 'webdriverio-service', dirname: 'eyes-webdriverio-5-service', framework: 'webdriverio', sdk: true, aliases: ['wdio-service', 'eyes-webdriverio-service', '@applitools/eyes-webdriverio-service'], dependencies: ['webdriverio']},
  {name: 'webdriverio-legacy', dirname: 'eyes-webdriverio-4', framework: 'webdriverio', sdk: true, aliases: ['wdio-legacy', 'eyes.webdriverio', '@applitools/eyes.webdriverio'], dependencies: ['types', 'utils', 'api', 'core', 'vgc', 'test-utils']},
  {name: 'selenium', dirname: 'eyes-selenium', framework: 'selenium-webdriver', sdk: true, aliases: ['@applitools/eyes-selenium'], dependencies: ['api', 'core', 'vgc', 'spec-selenium', 'test-utils']},
  {name: 'protractor', dirname: 'eyes-protractor', framework: 'protractor', sdk: true, aliases: ['@applitools/eyes-protractor'], dependencies: ['types', 'utils', 'api', 'core', 'vgc', 'test-utils']},
  {name: 'nightwatch', dirname: 'eyes-nightwatch', framework: 'nightwatch', sdk: true, aliases: ['nw', '@applitools/eyes-nightwatch'], dependencies: ['types', 'utils', 'api', 'core', 'vgc', 'test-utils']},
  {name: 'testcafe', dirname: 'eyes-testcafe', framework: 'testcafe', sdk: true, aliases: ['@applitools/eyes-testcafe'], dependencies: ['types', 'utils', 'api', 'core', 'vgc', 'test-utils']},
  {name: 'browser-extension', dirname: 'eyes-browser-extension', sdk: true, xvfb: true, aliases: ['extension', '@applitools/eyes-browser-extension'], dependencies: ['utils', 'core', 'vgc', 'spec-playwright', 'test-utils']},
  {name: 'cypress', dirname: 'eyes-cypress', framework: 'cypress', sdk: true, aliases: ['cy', '@applitools/eyes-cypress'], dependencies: ['logger', 'universal', 'vgc', 'api']},
  {name: 'storybook', dirname: 'eyes-storybook', framework: 'storybook', sdk: true, aliases: ['@applitools/eyes-storybook'], dependencies: ['logger', 'core', 'vgc', 'spec-puppeteer', 'test-utils']},
  // #endregion
]

const OS = {
  linux: 'ubuntu-latest',
  ubuntu: 'ubuntu-latest',
  mac: 'macos-latest',
  macos: 'macos-latest',
  win: 'windows-2022',
  windows: 'windows-2022',
}

const packageSettings = core.getInput('packages', {required: true})
const allowVariations = core.getBooleanInput('allow-variations')
const allowCascading = core.getBooleanInput('allow-cascading')
const defaultReleaseVersion = core.getInput('release-version')

core.notice(`Input provided: "${packageSettings}"`)

const packages = requestedPackages(packageSettings)

if (allowCascading) {
  const additionalPackages = dependentPackages(Object.values(packages).map(package => package.name))
  additionalPackages.forEach(package => {
    packages[package.name] = {
      displayName: package.name,
      name: package.name,
      dirname: package.dirname,
      sdk: package.sdk,
    }
  })
}

core.notice(`Packages to process: "${Object.values(packages).map(package => package.displayName).join(', ')}"`)

core.setOutput('packages', allowVariations ? Object.values(packages) : packages)

function requestedPackages(packageSettings) {
  return packageSettings.split(/[\s,]+/).reduce((packages, packageSetting) => {
    let [_, packageKey,  releaseVersion, frameworkVersion, frameworkProtocol, nodeVersion, jobOS, shortReleaseVersion, shortFrameworkVersion, shortFrameworkProtocol]
      = packageSetting.match(/^(.*?)(?:\((?:version:(patch|minor|major);?)?(?:framework:([\d.]+);?)?(?:protocol:(.+?);?)?(?:node:([\d.]+);?)?(?:os:(linux|ubuntu|mac|macos|win|windows);?)?\))?(?::(patch|minor|major))?(?:@([\d.]+))?(?:\+(.+?))?$/i)
  
    releaseVersion ??= shortReleaseVersion ?? defaultReleaseVersion
    frameworkVersion ??= shortFrameworkVersion
    frameworkProtocol ??= shortFrameworkProtocol

    const packageInfo = PACKAGES.find(({name, dirname, aliases}) => {
      return name === packageKey || dirname === packageKey || aliases.includes(packageKey)
    })
  
    if (!packageInfo) {
      core.warning(`Package name is unknown! Package configured as "${packageSetting}" will be ignored!`)
      return packages
    }
  
    if (frameworkVersion || frameworkProtocol) {
      if (!allowVariations) {
        core.warning(`Modifiers are not allowed! Package configured as "${packageSetting}" will be ignored!`)
        return packages
      } else if (!packageInfo.framework) {
        core.warning(`Framework modifiers are not allowed for package "${packageInfo.name}"! Package configured as "${packageSetting}" will be ignored!`)
        return packages
      }
    }
  
    const appendix = Object.entries({release: releaseVersion, version: frameworkVersion, protocol: frameworkProtocol, node: nodeVersion, os: jobOS})
      .reduce((parts, [key, value]) => value ? [...parts, `${key}: ${value}`] : parts, [])
      .join('; ')
  
    const package = {
      displayName: `${packageInfo.name} ${appendix ? `(${appendix})` : ''}`,
      name: packageInfo.name,
      dirname: packageInfo.dirname,
      sdk: packageInfo.sdk,
      xvfb: packageInfo.xvfb,
      releaseVersion,
      os: OS[jobOS ?? 'linux'],
      node: nodeVersion ?? 'lts/*',
      env: {
        [`APPLITOOLS_${packageInfo.name.toUpperCase()}_MAJOR_VERSION`]: frameworkVersion,
        [`APPLITOOLS_${packageInfo.name.toUpperCase()}_PROTOCOL`]: frameworkProtocol
      }
    }
  
    packages[allowVariations ? package.displayName : package.name] = package
  
    return packages
  }, {})
}

function dependentPackages(packageNames) {
  packageNames = [...packageNames]
  const dependentPackages = []

  let more = true
  while (more) {
    more = false
    for(packageInfo of PACKAGES) {
      if (
        !packageInfo.sdk &&
        !packageNames.includes(packageInfo.name) &&
        packageNames.some(packageName => packageInfo.dependencies.includes(packageName))
      ) {
        more = true
        packageNames.push(packageInfo.name)
        dependentPackages.push(packageInfo)
      }
    }
  }

  return dependentPackages
}