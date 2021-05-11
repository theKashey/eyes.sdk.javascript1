import BrowserName from '../enums/BrowserName'
import DeviceName from '../enums/DeviceName'
import IOSDeviceName from '../enums/IOSDeviceName'
import IOSVersion from '../enums/IOSVersion'
import ScreenOrientation from '../enums/ScreenOrientation'

export type DesktopBrowserInfo = {
  name?: BrowserName
  width: number
  height: number
}

export type ChromeEmulationInfo =
  | {chromeEmulationInfo: {deviceName: DeviceName; screenOrientation?: ScreenOrientation}}
  | {deviceName: DeviceName; screenOrientation?: ScreenOrientation}

export type IOSDeviceInfo = {
  iosDeviceInfo: {
    deviceName: IOSDeviceName
    iosVersion?: IOSVersion
    screenOrientation?: ScreenOrientation
  }
}
