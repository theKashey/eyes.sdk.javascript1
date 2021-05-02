const {describe, it} = require('mocha');
const path = require('path');
const {presult} = require('@applitools/functional-commons');
const {sh} = require('@applitools/sdk-shared/src/process-commons');
const snap = require('@applitools/snaptdout');

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
    const splittedResult = stdout.split('\n');
    const testResult = `${splittedResult[7]}\n${splittedResult[8]}`;
    await snap(testResult, 'fake ie');
  });
});
