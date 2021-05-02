const {describe, it, before, after} = require('mocha');
const testStorybook = require('../util/testStorybook');
const {expect} = require('chai');
const path = require('path');
const {delay: _psetTimeout, presult} = require('@applitools/functional-commons');
const {sh} = require('@applitools/sdk-shared/src/process-commons');

describe('eyes-storybook', () => {
  let closeStorybook;
  before(async () => {
    closeStorybook = await testStorybook({
      port: 9001,
      storybookConfigDir: path.resolve(__dirname, '../fixtures/jsLayoutStorybook'),
    });
  });

  after(async () => await closeStorybook());

  it('renders with layout breakpoints in config', async () => {
    const [err, result] = await presult(
      sh(
        `node ${path.resolve(__dirname, '../../bin/eyes-storybook')} -f ${path.resolve(
          __dirname,
          'happy-config/layout-breakpoints-global.config.js',
        )}`,
        {
          spawnOptions: {stdio: 'pipe'},
        },
      ),
    );
    const stdout = err ? err.stdout : result.stdout;
    //const stderr = err ? err.stderr : result.stderr;

    expect(stdout.replace(/\[Chrome \d+.\d+\]/g, '[Chrome]')).to.include(
      'JS Layout: JS Layout page [Chrome] [1000x800] - Passed\nJS Layout: JS Layout page [Safari 14.0] [810x1080] - Passed\nJS Layout: JS Layout page [Chrome] [412x869] - Passed\n\n\nNo differences were found!',
    );
  });

  it('renders with layout breakpoints in story parameters', async () => {
    const [err, result] = await presult(
      sh(
        `node ${path.resolve(__dirname, '../../bin/eyes-storybook')} -f ${path.resolve(
          __dirname,
          'happy-config/layout-breakpoints-local.config.js',
        )}`,
        {
          spawnOptions: {stdio: 'pipe'},
        },
      ),
    );
    const stdout = err ? err.stdout : result.stdout;
    //const stderr = err ? err.stderr : result.stderr;

    expect(stdout.replace(/\[Chrome \d+.\d+\]/g, '[Chrome]')).to.include(
      'JS Layout: JS Layout page [Chrome] [1000x800] - Passed\nJS Layout: JS Layout page [Safari 14.0] [810x1080] - Passed\nJS Layout: JS Layout page [Chrome] [412x869] - Passed\nJS Layout: JS Layout page without specifying layoutBreakpoints [Chrome] [1000x800] - Passed\nJS Layout: JS Layout page without specifying layoutBreakpoints [Safari 14.0] [810x1080] - Passed\nJS Layout: JS Layout page without specifying layoutBreakpoints [Chrome] [412x869] - Passed\n\n\nNo differences were found!',
    );
  });
});
