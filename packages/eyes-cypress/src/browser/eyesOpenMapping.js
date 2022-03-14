function eyesOpenMapValues({args, appliConfFile, testName, shouldUseBrowserHooks}) {
  let browsersInfo = args.browser || appliConfFile.browser;
  let accessibilitySettings = args.accessibilityValidation || appliConfFile.accessibilityValidation;
  const mappedValues = [
    'accessibilityValidation',
    'browser',
    'useDom',
    'matchLevel',
    'enablePatterns',
    'ignoreDisplacements',
    'ignoreCaret',
  ];

  if (browsersInfo) {
    if (Array.isArray(browsersInfo)) {
      browsersInfo.forEach(fillDefaultBrowserName);
    } else {
      fillDefaultBrowserName(browsersInfo);
      browsersInfo = [browsersInfo];
    }
  }

  const defaultMatchSettings = {
    accessibilitySettings,
    matchLevel: args.matchLevel || appliConfFile.matchLevel,
    ignoreCaret: args.ignoreCaret || appliConfFile.ignoreCaret,
    useDom: args.useDom || appliConfFile.useDom,
    enablePatterns: args.enablePatterns || appliConfFile.enablePatterns,
    ignoreDisplacements: args.ignoreDisplacements || appliConfFile.ignoreDisplacements,
  };

  for (const val of mappedValues) {
    if (args.hasOwnProperty(val)) {
      delete args[val];
    }
    if (appliConfFile.hasOwnProperty(val)) {
      delete appliConfFile[val];
    }
  }

  const mappedArgs = {
    ...args,
    browsersInfo,
    defaultMatchSettings,
  };

  return Object.assign(
    {testName, dontCloseBatches: !shouldUseBrowserHooks},
    appliConfFile,
    mappedArgs,
  );
}

function fillDefaultBrowserName(browser) {
  if (!browser.name && !browser.iosDeviceInfo && !browser.chromeEmulationInfo) {
    browser.name = 'chrome';
  }
}

module.exports = {eyesOpenMapValues};
