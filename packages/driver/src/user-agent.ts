import * as utils from '@applitools/utils'

type PlatformInfo = {platformName: string; platformVersion?: string}
type BrowserInfo = {browserName: string; browserVersion?: string}

const MAJOR_MINOR = '(\\d+)(?:[_.](\\d+))?'

const PLATFORM_REGEXES = [
  new RegExp(`(?:(Windows NT) ${MAJOR_MINOR})`),
  new RegExp('(?:(Windows XP))'),
  new RegExp('(?:(Windows 2000))'),
  new RegExp('(?:(Windows NT))'),
  new RegExp('(?:(Windows))'),
  new RegExp(`(?:(Mac OS X) ${MAJOR_MINOR})`),
  new RegExp(`(?:(Android) ${MAJOR_MINOR})`),
  new RegExp(`(?:(CPU(?: i[a-zA-Z]+)? OS) ${MAJOR_MINOR})`),
  new RegExp('(?:(Mac OS X))'),
  new RegExp('(?:(Mac_PowerPC))'),
  new RegExp('(?:(Linux))'),
  new RegExp('(?:(CrOS))'),
  new RegExp('(?:(SymbOS))'),
]

const BROWSER_REGEXPES = [
  new RegExp(`(?:(Opera)/${MAJOR_MINOR})`),
  new RegExp(`(?:(Edg)/${MAJOR_MINOR})`),
  new RegExp(`(?:(Edge)/${MAJOR_MINOR})`),
  new RegExp(`(?:(Chrome)/${MAJOR_MINOR})`),
  new RegExp(`(?:(Safari)/${MAJOR_MINOR})`),
  new RegExp(`(?:(Firefox)/${MAJOR_MINOR})`),
  new RegExp(`(?:MS(IE) ${MAJOR_MINOR})`),
]

const HIDDEN_IE_REGEX = new RegExp(`(?:rv:${MAJOR_MINOR}\\) like Gecko)`)

const BROWSER_VERSION_REGEX = new RegExp(`(?:Version/${MAJOR_MINOR})`)

export function parseUserAgent(userAgent: string): PlatformInfo & BrowserInfo {
  utils.guard.notNull(userAgent, {name: 'userAgent'})

  userAgent = userAgent.trim()
  return {
    ...parsePlatform(userAgent),
    ...parseBrowser(userAgent),
  }
}

export function parsePlatform(userAgent: string): PlatformInfo {
  const platformRegExp = PLATFORM_REGEXES.find(regexp => regexp.test(userAgent))

  if (!platformRegExp) return {platformName: 'Unknown'}

  const [_, platformName, platformMajorVersion, platformMinorVersion] = platformRegExp.exec(userAgent)

  if (platformName.startsWith('CPU')) {
    return {platformName: 'iOS', platformVersion: platformMajorVersion}
  } else if (platformName === 'Windows 2000' || platformName === 'Windows XP') {
    return {platformName: 'Windows', platformVersion: '5'}
  } else if (platformName === 'Windows NT') {
    const result = {platformName: 'Windows', platformVersion: platformMajorVersion}
    if (!platformMajorVersion) {
      result.platformVersion = '4'
    } else if (platformMajorVersion === '6' && platformMinorVersion === '1') {
      result.platformVersion = '7'
    } else if (platformMajorVersion === '6' && (platformMinorVersion === '2' || platformMinorVersion === '3')) {
      result.platformVersion = '8'
    }
    return result
  } else if (platformName === 'Mac_PowerPC') {
    return {platformName: 'Macintosh', platformVersion: platformMajorVersion}
  } else if (platformName === 'CrOS') {
    return {platformName: 'Chrome OS', platformVersion: platformMajorVersion}
  } else {
    return {platformName, platformVersion: platformMajorVersion}
  }
}

export function parseBrowser(userAgent: string): BrowserInfo {
  const browserRegExp = BROWSER_REGEXPES.find(regexp => regexp.test(userAgent))
  if (!browserRegExp) {
    if (HIDDEN_IE_REGEX.test(userAgent)) {
      const [_, browserVersion] = HIDDEN_IE_REGEX.exec(userAgent)
      return {browserName: 'IE', browserVersion}
    } else {
      return {browserName: 'Unknown'}
    }
  }

  const [_, browserName, browserVersion] = browserRegExp.exec(userAgent)
  const result = {browserName, browserVersion}

  if (result.browserName === 'Edg') result.browserName = 'Edge'
  if (BROWSER_VERSION_REGEX.test(userAgent)) {
    const [_, browserVersion] = BROWSER_VERSION_REGEX.exec(userAgent)
    result.browserVersion = browserVersion
  }

  return result
}
