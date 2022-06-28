const {describe, it, _before, _after} = require('mocha');
const path = require('path');
const {delay: _psetTimeout, presult} = require('@applitools/functional-commons');
const utils = require('@applitools/utils');
const snap = require('@applitools/snaptdout');
const {version} = require('../../package.json');

const envWithColor = {...process.env, FORCE_COLOR: true};
const spawnOptions = {stdio: 'pipe', env: envWithColor};

describe('eyes-storybook', () => {
  it('visual-grid-options', async () => {
    const [err, result] = await presult(
      utils.process.sh(
        `node ${path.resolve(__dirname, '../../bin/eyes-storybook')} -f ${path.resolve(
          __dirname,
          'happy-config/visual-grid-options.config.js',
        )}`,
        {spawnOptions},
      ),
    );
    const stdout = err ? err.stdout : result.stdout;
    const output = stdout
      .replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds')
      .replace(
        /See details at https\:\/\/.+.applitools.com\/app\/test-results\/.+/g,
        'See details at <some_url>',
      )
      .replace(version, '<version>')
      .replace(/\d+(?:\.\d+)+/g, '<browser_version>');
    await snap(output, 'visual grid options');
  });
});
