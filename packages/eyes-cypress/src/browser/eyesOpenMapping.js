function eyesOpenMapValues({args, appliConfFile, testName, shouldUseBrowserHooks}) {
  let browsersInfo = args.browser || appliConfFile.browser;
  let accessibilitySettings = args.accessibilityValidation || appliConfFile.accessibilityValidation;
  const batch = {
    id:
      args.batchId ||
      (args.batch ? args.batch.id : undefined) ||
      appliConfFile.batchId ||
      (appliConfFile.batch ? appliConfFile.batch.id : undefined),
    name:
      args.batchName ||
      (args.batch ? args.batch.name : undefined) ||
      appliConfFile.batchName ||
      (appliConfFile.batch ? appliConfFile.batch.name : undefined),
    sequenceName:
      args.batchSequenceName ||
      (args.batch ? args.batch.sequenceName : undefined) ||
      appliConfFile.batchSequenceName ||
      (appliConfFile.batch ? appliConfFile.batch.sequenceName : undefined),
  };

  if (!batch.name) {
    delete batch['name'];
  }
  if (!batch.sequenceName) {
    delete batch['sequenceName'];
  }

  const mappedValues = [
    'accessibilityValidation',
    'browser',
    'useDom',
    'matchLevel',
    'enablePatterns',
    'ignoreDisplacements',
    'ignoreCaret',
    'batchName',
    'batchId',
    'batchSequenceName',
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

  const appliConfFileCopy = {...appliConfFile};
  for (const val of mappedValues) {
    if (args.hasOwnProperty(val)) {
      delete args[val];
    }
    if (appliConfFileCopy.hasOwnProperty(val)) {
      delete appliConfFileCopy[val];
    }
  }

  const mappedArgs = {
    ...args,
    browsersInfo,
    defaultMatchSettings,
    batch,
  };

  return Object.assign(
    {testName, dontCloseBatches: !shouldUseBrowserHooks},
    appliConfFileCopy,
    mappedArgs,
  );
}

function fillDefaultBrowserName(browser) {
  if (!browser.name && !browser.iosDeviceInfo && !browser.chromeEmulationInfo) {
    browser.name = 'chrome';
  }
}

module.exports = {eyesOpenMapValues};
