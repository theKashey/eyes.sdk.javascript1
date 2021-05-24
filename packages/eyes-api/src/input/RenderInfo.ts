import {BrowserTypeLiteral} from '../enums/BrowserType'
import {DeviceNameLiteral} from '../enums/DeviceName'
import {IosDeviceNameLiteral} from '../enums/IosDeviceName'
import {IosVersionLiteral} from '../enums/IosVersion'
import {ScreenOrientationLiteral} from '../enums/ScreenOrientation'

export type DesktopBrowserInfo = {
  name?: BrowserTypeLiteral
  width: number
  height: number
}

export type ChromeEmulationInfo = {
  chromeEmulationInfo: {
    deviceName: DeviceNameLiteral
    screenOrientation?: ScreenOrientationLiteral
  }
}

/** @deprecated */
export type ChromeEmulationInfoLegacy = {
  deviceName: DeviceNameLiteral
  screenOrientation?: ScreenOrientationLiteral
}

export type IOSDeviceInfo = {
  iosDeviceInfo: {
    deviceName: IosDeviceNameLiteral
    iosVersion?: IosVersionLiteral
    screenOrientation?: ScreenOrientationLiteral
  }
}
