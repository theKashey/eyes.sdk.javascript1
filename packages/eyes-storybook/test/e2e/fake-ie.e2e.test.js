const {describe, it} = require('mocha');
const path = require('path');
const {presult} = require('@applitools/functional-commons');
const {sh} = require('@applitools/sdk-shared/src/process-commons');
const snap = require('@applitools/snaptdout');
const {version} = require('../../package.json');

describe('fake ie', () => {
  it('fake ie in storybook', async () => {
    const [err, result] = await presult(
      sh(
        `node ${path.resolve(__dirname, '../../bin/eyes-storybook')} -f ${path.resolve(
          __dirname,
          '../fixtures/fakeIE/applitools.config.js',
        )}`,
        {
          spawnOptions: {stdio: 'pipe'},
        },
      ),
    );
    const stdout = err ? err.stdout : result.stdout;
    const output = stdout
      .replace(/\/.*.bin\/start-storybook/, '<story-book path>')
      .replace(
        /See details at https\:\/\/.+.applitools.com\/app\/test-results\/.+/g,
        'See details at <some_url>',
      )
      .replace(version, '<version>');
    await snap(output, 'fake ie');
  });
});
