const {describe, it} = require('mocha');
const {expect} = require('chai');
const {eyesCheckMapValues} = require('../../../src/browser/eyesCheckMapping');

describe('eyes check mapping', () => {
  it('should mapp values correctly', () => {
    const args = {
      tag: 'some tag name',
      scriptHooks: {
        beforeCaptureScreenshot: "document.body.style.backgroundColor = 'gold'",
      },
      ignore: [{selector: 'some ignore region selector'}],
      layout: [{selector: 'some layout region selector'}],
      strict: [{selector: 'some strict region selector'}],
      content: [{selector: 'some content region selector'}],
      accessibility: [
        {selector: 'some accessibility region selector', accessibilityType: 'RegularText'},
      ],
      floating: [
        {
          selector: 'some floating region selector',
          maxUpOffset: 3,
          maxDownOffset: 3,
          maxLeftOffset: 20,
          maxRightOffset: 30,
        },
      ],
      variationGroupId: {variationGroupId: 'Login screen variation #1'},
      target: 'region',
      selector: {
        type: 'css',
        selector: '.my-element',
      },
      useDom: true,
      enablePatterns: true,
      matchLevel: 'Layout',
      visualGridOptions: {
        polyfillAdoptedStyleSheets: true,
      },
      layoutBreakpoints: [500, 1000],
      waitBeforeCapture: 2000,
      ignoreDisplacements: true,
      fully: false,
    };

    const expected = {
      name: 'some tag name',
      hooks: {
        beforeCaptureScreenshot: "document.body.style.backgroundColor = 'gold'",
      },
      ignoreRegions: [{selector: 'some ignore region selector'}],
      layoutRegions: [{selector: 'some layout region selector'}],
      strictRegions: [{selector: 'some strict region selector'}],
      contentRegions: [{selector: 'some content region selector'}],
      accessibilityRegions: [{region: 'some accessibility region selector', type: 'RegularText'}],
      floatingRegions: [
        {
          region: 'some floating region selector',
          maxUpOffset: 3,
          maxDownOffset: 3,
          maxLeftOffset: 20,
          maxRightOffset: 30,
        },
      ],
      variationGroupId: {variationGroupId: 'Login screen variation #1'},
      target: 'region',
      region: {
        selector: '.my-element',
        type: 'css',
      },
      useDom: true,
      enablePatterns: true,
      matchLevel: 'Layout',
      visualGridOptions: {
        polyfillAdoptedStyleSheets: true,
      },
      layoutBreakpoints: [500, 1000],
      waitBeforeCapture: 2000,
      ignoreDisplacements: true,
      fully: false,
    };

    const appliConfFile = {};

    const coreConfig = eyesCheckMapValues({args, appliConfFile});
    expect(coreConfig).to.be.deep.equal(expected);
  });
});
