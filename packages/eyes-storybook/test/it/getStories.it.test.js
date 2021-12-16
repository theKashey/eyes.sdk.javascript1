const puppeteer = require('puppeteer');
const {describe, it, before, after} = require('mocha');
const {expect} = require('chai');
const {testServerInProcess} = require('@applitools/test-server');
const testStorybook = require('../util/testStorybook');
const getStories = require('../../dist/getStories');
const {delay: psetTimeout} = require('@applitools/functional-commons');
const browserLog = require('../../src/browserLog');
const logger = require('../util/testLogger');

describe('getStories', () => {
  let closeTestServer, browser;
  before(async () => {
    const server = await testServerInProcess({port: 7272});
    closeTestServer = server.close;
    browser = await puppeteer.launch(); // {headless: false, devtools: true}
  });

  after(async () => {
    await closeTestServer();
    await browser.close();
  });

  it('gets stories', async () => {
    const page = await browser.newPage();
    const closeStorybook = await testStorybook({port: 9001});
    browserLog({page, onLog: text => logger.log(`[browser] ${text}`)});
    try {
      await page.goto('http://localhost:9001');
      const stories = await page.evaluate(getStories);
      const parameters = {
        framework: 'react',
        __isArgsStory: false,
        argTypes: {},
        args: {},
      };
      expect(stories).to.eql(
        [
          {
            name: 'background color',
            kind: 'Button',
            parameters: {
              ...parameters,
              __id: 'button--background-color',
              fileName: './test/fixtures/appWithStorybook/index.js',
              eyes: {runBefore: '__func', runAfter: '__func'},
            },
          },
          {
            name: 'with text',
            kind: 'Button',
            parameters: {
              ...parameters,
              __id: 'button--with-text',
              someParam: 'i was here, goodbye',
              fileName: './test/fixtures/appWithStorybook/index.js',
              eyes: {ignoreRegions: [{selector: '.ignore-this'}]},
            },
          },
          {
            name: 'with some emoji',
            kind: 'Button',
            error: `Ignoring parameters for story: "with some emoji Button" since they are not serilizable. Error: "Converting circular structure to JSON\n    --> starting at object with constructor 'Object'\n    --- property 'inner' closes the circle"`,
          },
          {
            name: 'image',
            kind: 'Image',
            parameters: {
              ...parameters,
              __id: 'image--image',
              fileName: './test/fixtures/appWithStorybook/index.js-2',
            },
          },
          {
            name: 'story 1',
            kind: 'Nested',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-3',
              __id: 'nested--story-1',
            },
          },
          {
            name: 'story 1.1',
            kind: 'Nested/Component',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-4',
              __id: 'nested-component--story-1-1',
            },
          },
          {
            name: 'story 1.2',
            kind: 'Nested/Component',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-4',
              __id: 'nested-component--story-1-2',
            },
          },
          {
            name: 'a yes-a b',
            kind: 'Button with-space yes-indeed',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-5',
              __id: 'button-with-space-yes-indeed--a-yes-a-b',
            },
          },
          {
            name: 'b yes-a b',
            kind: 'Button with-space yes-indeed/nested with-space yes',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-6',
              __id: 'button-with-space-yes-indeed-nested-with-space-yes--b-yes-a-b',
            },
          },
          {
            name: 'c yes-a b',
            kind: 'Button with-space yes-indeed/nested with-space yes/nested again-yes a',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-7',
              __id:
                'button-with-space-yes-indeed-nested-with-space-yes-nested-again-yes-a--c-yes-a-b',
            },
          },
          {
            name: 'story 1.1',
            kind: 'SOME section|Nested/Component',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-8',
              __id: 'some-section-nested-component--story-1-1',
            },
          },
          {
            name: 'story 1.2',
            kind: 'SOME section|Nested/Component',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-8',
              __id: 'some-section-nested-component--story-1-2',
            },
          },
          {
            name: 'c yes-a b',
            kind: 'Wow|one with-space yes-indeed/nested with-space yes/nested again-yes a',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-9',
              __id:
                'wow-one-with-space-yes-indeed-nested-with-space-yes-nested-again-yes-a--c-yes-a-b',
            },
          },
          {
            name: 'should also do RTL',
            kind: 'RTL',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-10',
              __id: 'rtl--should-also-do-rtl',
            },
          },
          {
            name: 'local RTL config',
            kind: 'RTL',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-10',
              __id: 'rtl--local-rtl-config',
              eyes: {variations: ['rtl']},
            },
          },
          {
            name: 'local theme config',
            kind: 'Theme',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-11',
              __id: 'theme--local-theme-config',
              eyes: {
                variations: [{queryParams: {theme: 'dark'}}, {queryParams: {theme: 'light'}}],
              },
            },
          },
          {
            name:
              'this story should not be checked visually by eyes-storybook because of local parameter',
            kind: 'skipped tests',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-12',
              __id:
                'skipped-tests--this-story-should-not-be-checked-visually-by-eyes-storybook-because-of-local-parameter',
              eyes: {include: false},
            },
          },
          {
            name:
              '[SKIP] this story should not be checked visually by eyes-storybook because of global config',
            kind: 'skipped tests',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-12',
              __id:
                'skipped-tests--skip-this-story-should-not-be-checked-visually-by-eyes-storybook-because-of-global-config',
            },
          },
          {
            name: 'testing circular parameters',
            kind: 'skipped tests',
            parameters: {eyes: {include: false}}, // note that fileName and framework parameters are not present here because of the circular reference
          },
          {
            kind: 'Text',
            name: 'appears after a delay',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-13',
              __id: 'text--appears-after-a-delay',
              eyes: {
                waitBeforeCapture: '.ready',
              },
            },
          },
          {
            name: 'Popover',
            kind: 'Interaction',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-14',
              __id: 'interaction--popover',
              bgColor: 'lime',
              eyes: {runBefore: '__func'},
            },
          },
          {
            kind: 'Responsive UI',
            name: 'Red/green',
            parameters: {
              ...parameters,
              fileName: './test/fixtures/appWithStorybook/index.js-15',
              __id: 'responsive-ui--red-green',
            },
          },
        ].map((story, index) => {
          return {
            ...story,
            index,
            isApi: true,
          };
        }),
      );
    } finally {
      await closeStorybook();
    }
  });

  it('fails on timeout', async () => {
    const page = await browser.newPage();
    browserLog({page, onLog: text => logger.log(`[browser] ${text}`)});

    await page.goto('http://localhost:7272');

    const result = await Promise.race([
      page.evaluate(getStories, {timeout: 100}).catch(err => err.message),
      psetTimeout(200).then(() => 'not ok'),
    ]);

    expect(result).to.equal(
      'Evaluation failed: could not determine storybook version in order to extract stories',
    );
  });
});
