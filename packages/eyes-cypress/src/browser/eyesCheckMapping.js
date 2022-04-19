function eyesCheckMapValues({args}) {
  return toCheckWindowConfiguration(args);
}

function toCheckWindowConfiguration(config = {}) {
  const mappedValues = [
    'tag',
    'scriptHooks',
    'ignore',
    'floating',
    'strict',
    'layout',
    'content',
    'accessibility',
    'region',
    'selector',
  ];

  let regionSettings = {};
  let shadowDomSettings = {};
  const checkSettings = {
    name: config.tag,
    hooks: config.scriptHooks,
    ignoreRegions: config.ignore,
    floatingRegions: convertFloatingRegion(config.floating),
    strictRegions: config.strict,
    layoutRegions: config.layout,
    contentRegions: config.content,
    accessibilityRegions: convertAccessabilityRegions(config.accessibility),
  };

  if (config.target === 'region') {
    if (!Array.isArray(config.selector)) {
      if (!config.hasOwnProperty('selector')) {
        regionSettings = {
          region: config.region,
        };
      } else {
        regionSettings = {
          region: config.selector,
        };
      }
    } else {
      const selectors = config.selector;
      for (let i = selectors.length - 1; i > -1; i--) {
        if (i === selectors.length - 1) {
          shadowDomSettings['shadow'] = selectors[i].selector;
        } else {
          const prevSettings = Object.assign({}, shadowDomSettings);
          shadowDomSettings['selector'] = selectors[i].selector;
          if (!prevSettings.hasOwnProperty('selector')) {
            shadowDomSettings['shadow'] = prevSettings.shadow;
          } else {
            shadowDomSettings['shadow'] = prevSettings;
          }
        }
      }
      regionSettings = {region: shadowDomSettings};
    }
  }

  for (const val of mappedValues) {
    if (config.hasOwnProperty(val)) {
      delete config[val];
    }
  }

  return Object.assign({}, checkSettings, regionSettings, config);
}

function convertAccessabilityRegions(accessibilityRegions) {
  if (!accessibilityRegions) return accessibilityRegions;

  return accessibilityRegions.map(region => ({
    region: region.selector,
    type: region.accessibilityType,
  }));
}

function convertFloatingRegion(floatingRegions) {
  if (!floatingRegions) return floatingRegions;

  return floatingRegions.map(region => {
    const floatingRegion = {
      maxDownOffset: region.maxDownOffset || 0,
      maxLeftOffset: region.maxLeftOffset || 0,
      maxUpOffset: region.maxUpOffset || 0,
      maxRightOffset: region.maxRightOffset || 0,
    };
    if (region.hasOwnProperty('selector')) {
      floatingRegion.region = region.selector;
    } else {
      floatingRegion.region = {
        top: region.top,
        left: region.left,
        width: region.width,
        height: region.height,
      };
    }
    return floatingRegion;
  });
}

module.exports = {eyesCheckMapValues};
