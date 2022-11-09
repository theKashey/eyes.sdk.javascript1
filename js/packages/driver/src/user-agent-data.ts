import {type DriverInfo} from './spec-driver'

type UserAgentData = {
  brands: {brand: string; version: string}[]
  platform: string
  platformVersion?: string
  model?: string
  mobile?: boolean
}

const WINDOWS_VERSIONS = {
  '0.1.0': '7',
  '0.2.0': '8',
  '0.3.0': '8.1',
  '10.0.0': '10',
  '15.0.0': '11',
}

export function parseUserAgentData(userAgentData: UserAgentData): DriverInfo {
  const chromiumBrand = userAgentData.brands?.find(brand => /Chromium/i.test(brand.brand))
  const browserBrand =
    userAgentData.brands?.find(brand => brand !== chromiumBrand && !/Not.?A.?Brand/i.test(brand.brand)) ?? chromiumBrand

  const info: DriverInfo = {
    browserName: browserBrand?.brand,
    browserVersion: browserBrand?.version,
    platformName: userAgentData.platform || undefined,
    platformVersion: userAgentData.platformVersion || undefined,
    deviceName: userAgentData.model || undefined,
    isMobile: userAgentData.mobile,
    isChromium: Boolean(chromiumBrand),
  }

  if (info.platformName === 'Windows') {
    info.platformVersion = WINDOWS_VERSIONS[info.platformVersion]
  } else if (info.platformName === 'macOS') {
    info.platformName = 'Mac OS X'
    info.platformVersion = info.platformVersion.split(/[._]/, 2).join('.')
  }

  return info
}
