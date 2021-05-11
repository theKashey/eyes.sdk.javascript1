const {BrowserType} = require('@applitools/eyes-sdk-core');

function splitConfigsByBrowser(config) {
  const browsers = validateBrowsers(config);
  if (browsers.length) {
    const result = browsers.reduce(
      ([nonIE, IE], browser) => {
        if (isIE(browser)) {
          IE.push(browser);
        } else {
          nonIE.push(browser);
        }
        return [nonIE, IE];
      },
      [[], []],
    );

    return result.reduce(
      (acc, browser) => (browser.length > 0 ? acc.concat({...config, browser}) : acc),
      [],
    );
  } else {
    return [config];
  }
}

function shouldRenderIE(config) {
  return hasIE(config) && config.fakeIE;
}

function hasIE(config) {
  return validateBrowsers(config).some(isIE);
}

function isIE(browser) {
  return browser.name === BrowserType.IE_11 || browser.name === 'ie11';
}

function validateBrowsers(config) {
  if (config.browser) {
    return Array.isArray(config.browser) ? config.browser : [config.browser];
  } else {
    return [];
  }
}

module.exports = {splitConfigsByBrowser, shouldRenderIE, isIE};
