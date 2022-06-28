import {BrowserType} from '../enums/BrowserType'
import {DeviceName} from '../enums/DeviceName'
import {IosDeviceName} from '../enums/IosDeviceName'
import {IosVersion} from '../enums/IosVersion'
import {AndroidDeviceName} from '../enums/AndroidDeviceName'
import {AndroidVersion} from '../enums/AndroidVersion'
import {ScreenOrientation} from '../enums/ScreenOrientation'

export type DesktopBrowserInfo = {
  name?: BrowserType
  width: number
  height: number
}

export type ChromeEmulationInfo = {
  chromeEmulationInfo: {
    deviceName: DeviceName
    screenOrientation?: ScreenOrientation
  }
}

/** @deprecated */
export type ChromeEmulationInfoLegacy = {
  deviceName: DeviceName
  screenOrientation?: ScreenOrientation
}

export type IOSDeviceInfo = {
  iosDeviceInfo: {
    deviceName: IosDeviceName
    iosVersion?: IosVersion
    screenOrientation?: ScreenOrientation
  }
}

export type AndroidDeviceInfo = {
  androidDeviceInfo: {
    deviceName: AndroidDeviceName
    version?: AndroidVersion
    screenOrientation?: ScreenOrientation
  }
}
