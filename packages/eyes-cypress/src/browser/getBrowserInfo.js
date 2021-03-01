function getBrowserInfo(browser, sendRequest) {
  const isMobile =
    browser.deviceName || browser.mobile || browser.iosDeviceInfo || browser.chromeEmulationInfo;
  if (isMobile) {
    const {deviceName, screenOrientation = 'portrait'} =
      browser.iosDeviceInfo || browser.chromeEmulationInfo || browser;
    const command = browser.iosDeviceInfo ? 'getIosDevicesSizes' : 'getEmulatedDevicesSizes';
    return sendRequest({command}).then(devicesSizes => {
      if (!devicesSizes.hasOwnProperty(deviceName)) {
        handleDeviceError(browser);
      }
      const size = devicesSizes[deviceName][screenOrientation];
      return {name: deviceName, ...size};
    });
  } else {
    const {name, width} = browser;
    return Promise.resolve({name, width});
  }
}

function handleDeviceError(browser) {
  const baseUrl =
    'https://github.com/applitools/eyes.sdk.javascript1/blob/master/packages/eyes-sdk-core/lib/config';
  const deviceName = browser.deviceName;
  const category = browser.iosDeviceInfo
    ? {
        name: 'iOS',
        url: `${baseUrl}/IosDeviceName.js`,
      }
    : {
        name: 'emulated',
        url: `${baseUrl}/DeviceName.js`,
      };
  throw new Error(
    `'${deviceName}' does not exist in the list of ${category.name} devices.\nplease see the device list at: ${category.url}`,
  );
}

module.exports = getBrowserInfo;
