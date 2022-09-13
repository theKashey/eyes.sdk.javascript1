from applitools.common import (
    ChromeEmulationInfo,
    DesktopBrowserInfo,
    DeviceName,
    IosDeviceInfo,
    IosDeviceName,
    IosVersion,
    ScreenOrientation,
)
from applitools.selenium import schema
from applitools.selenium.schema import demarshal_error


def test_demarshal_browser_info():
    deserializer = schema.BrowserInfo(allow_none=True)
    assert DesktopBrowserInfo(800, 600, "chrome") == deserializer.deserialize(
        {"width": 800, "height": 600, "name": "chrome"}
    )
    assert DesktopBrowserInfo(
        800, 600, "chrome-one-version-back"
    ) == deserializer.deserialize(
        {"width": 800, "height": 600, "name": "chrome-one-version-back"}
    )
    assert IosDeviceInfo(IosDeviceName.iPhone_12) == deserializer.deserialize(
        {
            "iosDeviceInfo": {
                "deviceName": "iPhone 12",
                "screenOrientation": "portrait",
            }
        }
    )
    assert IosDeviceInfo(
        IosDeviceName.iPhone_12, ScreenOrientation.PORTRAIT, IosVersion.ONE_VERSION_BACK
    ) == deserializer.deserialize(
        {
            "iosDeviceInfo": {
                "deviceName": "iPhone 12",
                "screenOrientation": "portrait",
                "iosVersion": "latest-1",
            }
        }
    )
    assert ChromeEmulationInfo(DeviceName.Galaxy_S10) == deserializer.deserialize(
        {
            "chromeEmulationInfo": {
                "deviceName": "Galaxy S10",
                "screenOrientation": "portrait",
            }
        }
    )


def test_demarshal_usdk_error():
    exc = demarshal_error(
        {
            "message": "Message.",
            "stack": "Error: Message.\n  stack trace line 1\n  stack trace line 2",
        }
    )
    assert str(exc) == "Message.\n  stack trace line 1\n  stack trace line 2"
