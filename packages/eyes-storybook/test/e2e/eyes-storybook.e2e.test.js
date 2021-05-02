const {describe, it, before, after} = require('mocha');
const {expect} = require('chai');
const path = require('path');
const testServer = require('@applitools/sdk-shared/src/run-test-server');
const {sh} = require('@applitools/sdk-shared/src/process-commons');
const {delay: psetTimeout, presult} = require('@applitools/functional-commons');
const {version} = require('../../package.json');
const snap = require('@applitools/snaptdout');

describe('eyes-storybook', () => {
  let closeTestServer, showLogsOrig;
  before(async () => {
    closeTestServer = (await testServer({port: 7272})).close;
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
    process.env.APPLITOOLS_SHOW_LOGS = showLogsOrig;
  });

  it('renders test storybook', async () => {
    const [err, result] = await presult(
      sh(
        `node ${path.resolve(__dirname, '../../bin/eyes-storybook')} -f ${path.resolve(
          __dirname,
          'happy-config/applitools.config.js',
        )}`,
        {
          spawnOptions: {stdio: 'pipe'},
        },
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
      .replace(/\/.*.bin\/start-storybook/, '<story-book path>')
      .replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds');
    await snap(normalizedStdout, 'stdout');
    await snap(stderr, 'stderr');
  });

  it('fails with proper message when failing to get stories because of undetermined version', async () => {
    const promise = presult(
      sh(`node ./bin/eyes-storybook -u http://localhost:7272 --read-stories-timeout=500`, {
        spawnOptions: {stdio: 'pipe'},
      }),
    );
    const results = await Promise.race([promise, psetTimeout(5000).then(() => 'not ok')]);

    expect(results).not.to.equal('not ok');
    const stdout = results[0].stdout.replace(version, '<version>');
    await snap(stdout, 'undetermined version stdout');
    await snap(results[0].stderr, 'undetermined version stderr');
  });

  it('fails with proper message when failing to get stories because of navigation timeout', async () => {
    const promise = presult(
      sh(`node ./bin/eyes-storybook --read-stories-timeout=10 -u http://localhost:9001`, {
        spawnOptions: {stdio: 'pipe'},
      }),
    );
    const results = await Promise.race([promise, psetTimeout(3000).then(() => 'not ok')]);

    expect(results).not.to.equal('not ok');
    const stdout = results[0].stdout
      .replace(version, '<version>')
      .replace(/\/.*.bin\/start-storybook/, '<story-book path>');
    await snap(stdout, 'navigation timeout stdout');
    await snap(results[0].stderr, 'navigation timeout stderr');
  });

  it('fails with proper message when failing to get stories because storybook is loading too slowly', async () => {
    const promise = presult(
      sh(
        `node ./bin/eyes-storybook --read-stories-timeout=1000 -u http://localhost:7272/storybook-loading.html`,
        {
          spawnOptions: {stdio: 'pipe'},
        },
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
      sh(
        `node ${path.resolve(__dirname, '../../bin/eyes-storybook')} -f ${path.resolve(
          __dirname,
          'happy-config/single.config.js',
        )}`,
        {
          spawnOptions: {stdio: 'pipe'},
        },
      ),
    );

    const stdout = err ? err.stdout : result.stdout;
    const stderr = err ? err.stderr : result.stderr;

    const normalizedStdout = stdout
      .replace(
        /See details at https\:\/\/.+.applitools.com\/app\/test-results\/.+/g,
        'See details at <some_url>',
      )
      .replace(/\/.*.bin\/start-storybook/, '<story-book path>')
      .replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds')
      .replace(version, '<version>')
      .replace(/\[(Chrome|Firefox) \d+\.\d+\]/g, '[$1]');

    await snap(normalizedStdout, 'multi browser stdout');
    await snap(stderr, 'multi browser stderr');
  });
});
