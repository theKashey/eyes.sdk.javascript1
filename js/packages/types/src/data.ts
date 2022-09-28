export type SessionType = 'SEQUENTIAL' | 'PROGRESSION'

export type StitchMode = 'CSS' | 'Scroll'

export type MatchLevel = 'None' | 'Layout1' | 'Layout' | 'Layout2' | 'Content' | 'IgnoreColor' | 'Strict' | 'Exact'

export type AccessibilityRegionType = 'IgnoreContrast' | 'RegularText' | 'LargeText' | 'BoldText' | 'GraphicalObject'

export type AccessibilityLevel = 'AA' | 'AAA'

export type AccessibilityGuidelinesVersion = 'WCAG_2_0' | 'WCAG_2_1'

export type AccessibilityStatus = 'Passed' | 'Failed'

export type TestResultsStatus = 'Passed' | 'Unresolved' | 'Failed'

export type Proxy = {
  url: string
  username?: string
  password?: string
  isHttpOnly?: boolean
}

export type AutProxy = Proxy & {
  mode?: 'Allow' | 'Block'
  domains?: string[]
}

export type CustomProperty = {
  name: string
  value: string
}

export type Batch = {
  id?: string
  name?: string
  sequenceName?: string
  startedAt?: Date | string
  notifyOnCompletion?: boolean
  properties?: CustomProperty[]
}

export type Location = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export type Region = Location & Size

export type TextRegion = Region & {text: string}

export type ImageRotation = -270 | -180 | -90 | 0 | 90 | 180 | 270

export type OffsetRect = {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export type ImageCropRect = OffsetRect

export type ImageCropRegion = {
  x: number
  y: number
  width: number
  height: number
}

export type DesktopBrowser =
  | 'chrome'
  | 'chrome-one-version-back'
  | 'chrome-two-versions-back'
  | 'firefox'
  | 'firefox-one-version-back'
  | 'firefox-two-versions-back'
  | 'ie'
  | 'ie10'
  | 'edge'
  | 'edgechromium'
  | 'edgelegacy'
  | 'edgechromium-one-version-back'
  | 'edgechromium-two-versions-back'
  | 'safari'
  | 'safari-earlyaccess'
  | 'safari-one-version-back'
  | 'safari-two-versions-back'

export type DesktopBrowserRenderer = {
  name?: DesktopBrowser
  width: number
  height: number
}

export type ScreenOrientation = 'portrait' | 'landscape'

export type ChromeEmulationDevice =
  | 'Blackberry PlayBook'
  | 'BlackBerry Z30'
  | 'Galaxy A5'
  | 'Galaxy Note 10'
  | 'Galaxy Note 10 Plus'
  | 'Galaxy Note 2'
  | 'Galaxy Note 3'
  | 'Galaxy Note 4'
  | 'Galaxy Note 8'
  | 'Galaxy Note 9'
  | 'Galaxy S3'
  | 'Galaxy S5'
  | 'Galaxy S8'
  | 'Galaxy S8 Plus'
  | 'Galaxy S9'
  | 'Galaxy S9 Plus'
  | 'Galaxy S10'
  | 'Galaxy S10 Plus'
  | 'Galaxy S20'
  | 'Galaxy S22'
  | 'Galaxy Tab S7'
  | 'iPad'
  | 'iPad 6th Gen'
  | 'iPad 7th Gen'
  | 'iPad Air 2'
  | 'iPad Mini'
  | 'iPad Pro'
  | 'iPhone 11'
  | 'iPhone 11 Pro'
  | 'iPhone 11 Pro Max'
  | 'iPhone 4'
  | 'iPhone 5/SE'
  | 'iPhone 6/7/8'
  | 'iPhone 6/7/8 Plus'
  | 'iPhone X'
  | 'iPhone XR'
  | 'iPhone XS'
  | 'iPhone XS Max'
  | 'Kindle Fire HDX'
  | 'Laptop with HiDPI screen'
  | 'Laptop with MDPI screen'
  | 'Laptop with touch'
  | 'LG G6'
  | 'LG Optimus L70'
  | 'Microsoft Lumia 550'
  | 'Microsoft Lumia 950'
  | 'Nexus 10'
  | 'Nexus 4'
  | 'Nexus 5'
  | 'Nexus 5X'
  | 'Nexus 6'
  | 'Nexus 6P'
  | 'Nexus 7'
  | 'Nokia Lumia 520'
  | 'Nokia N9'
  | 'OnePlus 7T'
  | 'OnePlus 7T Pro'
  // | 'OnePlus 8'
  // | 'OnePlus 8 Pro'
  | 'Pixel 2'
  | 'Pixel 2 XL'
  | 'Pixel 3'
  | 'Pixel 3 XL'
  | 'Pixel 4'
  | 'Pixel 4 XL'
  | 'Pixel 5'
  | 'Sony Xperia 10 II'

export type ChromeEmulationDeviceRenderer = {
  chromeEmulationInfo: {
    deviceName: ChromeEmulationDevice
    screenOrientation?: ScreenOrientation
  }
}

export type IOSDevice =
  | 'iPhone 14 Pro Max'
  | 'iPhone 14'
  | 'iPhone 13 Pro Max'
  | 'iPhone 13 Pro'
  | 'iPhone 13'
  | 'iPhone 12 Pro Max'
  | 'iPhone 12 Pro'
  | 'iPhone 12'
  | 'iPhone 12 mini'
  | 'iPhone 11 Pro'
  | 'iPhone 11 Pro Max'
  | 'iPhone 11'
  | 'iPhone XR'
  | 'iPhone Xs'
  | 'iPhone X'
  | 'iPhone 8'
  | 'iPhone 8 Plus'
  | 'iPhone 7'
  | 'iPhone SE (1st generation)'
  | 'iPad Pro (12.9-inch) (3rd generation)'
  | 'iPad (7th generation)'
  | 'iPad (9th generation)'
  | 'iPad Air (2nd generation)'
  | 'iPad Air (4th generation)'

export type IOSVersion = 'latest' | 'latest-1'

export type IOSDeviceRenderer = {
  iosDeviceInfo: {
    deviceName: IOSDevice
    version?: IOSVersion
    screenOrientation?: ScreenOrientation
  }
}

export type AndroidDevice =
  | 'Pixel 3 XL'
  | 'Pixel 4'
  | 'Pixel 4 XL'
  | 'Pixel 5'
  | 'Pixel 6'
  | 'Galaxy Note 8'
  | 'Galaxy Note 9'
  | 'Galaxy S8'
  | 'Galaxy S8 Plus'
  | 'Galaxy S9'
  | 'Galaxy S9 Plus'
  | 'Galaxy S10'
  | 'Galaxy S10 Plus'
  | 'Galaxy Note 10'
  | 'Galaxy Note 10 Plus'
  | 'Galaxy S20'
  | 'Galaxy S20 Plus'
  | 'Galaxy S21'
  | 'Galaxy S21 Plus'
  | 'Galaxy S21 Ultra'
  | 'Galaxy S22'
  | 'Galaxy S22 Plus'
  | 'Galaxy Tab S7'
  | 'Galaxy Tab S8'
  | 'Xiaomi Redmi Note 11'
  | 'Xiaomi Redmi Note 11 Pro'

export type AndroidVersion = 'latest' | 'latest-1' | 'latest-2'

export type AndroidDeviceRenderer = {
  androidDeviceInfo: {
    deviceName: AndroidDevice
    version?: AndroidVersion
    screenOrientation?: ScreenOrientation
  }
}
export type Renderer =
  | DesktopBrowserRenderer
  | ChromeEmulationDeviceRenderer
  | IOSDeviceRenderer
  | AndroidDeviceRenderer
