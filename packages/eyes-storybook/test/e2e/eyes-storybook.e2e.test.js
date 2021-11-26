const {describe, it, before, after} = require('mocha');
const {expect} = require('chai');
const path = require('path');
const {testServerInProcess} = require('@applitools/test-server');
const utils = require('@applitools/utils');
const {delay: psetTimeout, presult} = require('@applitools/functional-commons');
const {version} = require('../../package.json');
const snap = require('@applitools/snaptdout');

const envWithColor = {...process.env, FORCE_COLOR: true};
const spawnOptions = {stdio: 'pipe', env: envWithColor};

describe('eyes-storybook', () => {
  let closeTestServer, showLogsOrig;
  before(async () => {
    closeTestServer = (await testServerInProcess({port: 7272})).close;
    showLogsOrig = process.env.APPLITOOLS_SHOW_LOGS;
    if (showLogsOrig) {
      console.warn(
        '\nThis test disables APPLITOOLS_SHOW_LOGS so dont be surprised son !!! See: test/e2e/eyes-storybook.e2e.test.js:15\n',
      );
    }
    delete process.env.APPLITOOLS_SHOW_LOGS;
  });

  after(async () => {
    await closeTestServer();
    process.env.APPLITOOLS_SHOW_LOGS = '';
  });

  it('renders test storybook', async () => {
    const [err, result] = await presult(
      utils.process.sh(
        `node ${path.resolve(__dirname, '../../bin/eyes-storybook')} -f ${path.resolve(
          __dirname,
          'happy-config/applitools.config.js',
        )}`,
        {spawnOptions},
      ),
    );

    const stdout = err ? err.stdout : result.stdout;
    const stderr = err ? err.stderr : result.stderr;
    const normalizedStdout = stdout
      .replace(/\[Chrome \d+.\d+\]/g, '[Chrome]')
      .replace(version, '<version>')
      .replace(
        /See details at https\:\/\/.+.applitools.com\/app\/test-results\/.+/g,
        'See details at <some_url>',
      )
      .replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds');
    await snap(normalizedStdout, 'stdout');
    await snap(stderr, 'stderr');
  });

  it('renders stories with global query params', async () => {
    const [err, result] = await presult(
      utils.process.sh(
        `node ${path.resolve(__dirname, '../../bin/eyes-storybook')} -f ${path.resolve(
          __dirname,
          'happy-config/global-query-params.config.js',
        )}`,
        {spawnOptions},
      ),
    );

    const stdout = err ? err.stdout : result.stdout;
    const normalizedStdout = stdout
      .replace(/\[Chrome \d+.\d+\]/g, '[Chrome]')
      .replace(version, '<version>')
      .replace(
        /See details at https\:\/\/.+.applitools.com\/app\/test-results\/.+/g,
        'See details at <some_url>',
      )
      .replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds');

    await snap(normalizedStdout, 'global query params');
  });

  it('fails with proper message when failing to get stories because of undetermined version', async () => {
    const promise = presult(
      utils.process.sh(
        `node ./bin/eyes-storybook -u http://localhost:7272 --read-stories-timeout=500`,
        {spawnOptions},
      ),
    );
    const results = await Promise.race([promise, psetTimeout(5000).then(() => 'not ok')]);

    expect(results).not.to.equal('not ok');
    const stdout = results[0].stdout.replace(version, '<version>');
    await snap(stdout, 'undetermined version stdout');
    await snap(results[0].stderr, 'undetermined version stderr');
  });

  it('fails with proper message when failing to get stories because of navigation timeout', async () => {
    const promise = presult(
      utils.process.sh(
        `node ./bin/eyes-storybook --read-stories-timeout=10 -u http://localhost:9001`,
        {spawnOptions},
      ),
    );
    const results = await Promise.race([promise, psetTimeout(3000).then(() => 'not ok')]);

    expect(results).not.to.equal('not ok');
    const stdout = results[0].stdout.replace(version, '<version>');
    await snap(stdout, 'navigation timeout stdout');
    await snap(results[0].stderr, 'navigation timeout stderr');
  });

  it('fails with proper message when failing to get stories because storybook is loading too slowly', async () => {
    const promise = presult(
      utils.process.sh(
        `node ./bin/eyes-storybook --read-stories-timeout=1000 -u http://localhost:7272/storybook-loading.html`,
        {spawnOptions},
      ),
    );
    const results = await Promise.race([promise, psetTimeout(5000).then(() => 'not ok')]);

    expect(results).not.to.equal('not ok');
    const stdout = results[0].stdout.replace(version, '<version>');
    await snap(stdout, 'too slowly stdout');
    await snap(results[0].stderr, 'too slowly stderr');
  });

  it('renders multi browser versions', async () => {
    const [err, result] = await presult(
      utils.process.sh(
        `node ${path.resolve(__dirname, '../../bin/eyes-storybook')} -f ${path.resolve(
          __dirname,
          'happy-config/single.config.js',
        )}`,
        {spawnOptions},
      ),
    );

    const stdout = err ? err.stdout : result.stdout;
    const stderr = err ? err.stderr : result.stderr;

    const normalizedStdout = stdout
      .replace(
        /See details at https\:\/\/.+.applitools.com\/app\/test-results\/.+/g,
        'See details at <some_url>',
      )
      .replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds')
      .replace(version, '<version>')
      .replace(/\[(Chrome|Firefox) \d+\.\d+\]/g, '[$1]');

    await snap(normalizedStdout, 'multi browser stdout');
    await snap(stderr, 'multi browser stderr');
  });
});
