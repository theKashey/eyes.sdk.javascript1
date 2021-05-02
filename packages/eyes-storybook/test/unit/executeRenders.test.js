const {describe, it} = require('mocha');
const {expect} = require('chai');
const executeRenders = require('../../src/executeRenders');
const {presult} = require('@applitools/functional-commons');

describe('executeRenders', () => {
  it('should call executeRender for each config', async () => {
    const results = {};
    let counter = 0;
    const stories = [{hello: 'world'}];
    const viewport = {width: 800, height: 600};
    const configs = [
      {browser: [{name: 'chrome', ...viewport}]},
      {browser: [{name: 'firefox', ...viewport}]},
    ];
    const [err, result] = await executeRenders({
      timeItAsync: (_a, cb) => cb(),
      renderStories: async function(stories, config) {
        Object.assign(results[counter], {config});
        return [undefined, stories];
      },
      pagePool: {},
      stories,
      configs,
      logger: {
        verbose: function(txt) {
          counter++;
          if (!results[counter]) {
            results[counter] = {log: [txt]};
          } else {
            results[counter].log.push(txt);
          }
        },
      },
      setRenderIE: () => {},
    });

    expect(err).to.be.undefined;
    expect(result).to.deep.equal(stories);
    expect(results.pagePoolDrained).to.be.undefined;
    expect(results).to.deep.equal({
      '1': {
        log: [
          'executing render story with {"browser":[{"name":"chrome","width":800,"height":600}]}',
        ],
        config: {
          browser: [
            {
              name: 'chrome',
              width: 800,
              height: 600,
            },
          ],
        },
      },
      '2': {
        log: [
          'executing render story with {"browser":[{"name":"firefox","width":800,"height":600}]}',
        ],
        config: {
          browser: [
            {
              name: 'firefox',
              width: 800,
              height: 600,
            },
          ],
        },
      },
    });
  });

  it('should drain pool in case of IE', async () => {
    const results = {};
    let counter = 0;
    let poolDrained = false;
    let renderIE = false;
    const viewport = {width: 800, height: 600};
    const stories = [{hello: 'world'}];
    const configs = [
      {browser: [{name: 'chrome', ...viewport}]},
      {browser: [{name: 'ie', ...viewport}], fakeIE: true},
    ];
    const [err, result] = await executeRenders({
      timeItAsync: (_a, cb) => cb(),
      setTransitioningIntoIE: () => {},
      renderStories: async function(stories, config) {
        Object.assign(results[counter], {stories, config});
        return [undefined, stories];
      },
      pagePool: {drain: () => (poolDrained = true)},
      configs,
      stories,
      logger: {
        verbose: function(txt) {
          counter++;
          if (!results[counter]) {
            results[counter] = {log: [txt]};
          } else {
            results[counter].log.push(txt);
          }
        },
      },
      setRenderIE: value => (renderIE = value),
    });

    expect(err).to.be.undefined;
    expect(result).to.deep.equal(stories);
    expect(poolDrained).to.be.true;
    expect(renderIE).to.be.true;
    expect(results).to.deep.equal({
      '1': {
        log: [
          'executing render story with {"browser":[{"name":"chrome","width":800,"height":600}]}',
        ],
        stories: [
          {
            hello: 'world',
          },
        ],
        config: {
          browser: [
            {
              name: 'chrome',
              width: 800,
              height: 600,
            },
          ],
        },
      },
      '2': {
        log: [
          'executing render story with {"browser":[{"name":"ie","width":800,"height":600}],"fakeIE":true}',
        ],
        stories: [
          {
            hello: 'world',
          },
        ],
        config: {
          browser: [
            {
              name: 'ie',
              width: 800,
              height: 600,
            },
          ],
          fakeIE: true,
        },
      },
    });
  });

  it('should handle exceptions in renderStories', async () => {
    let counter = 0;
    const stories = [{hello: 'world'}];
    const viewport = {width: 800, height: 600};
    const configs = [
      {browser: [{name: 'chrome', ...viewport}]},
      {browser: [{name: 'firefox', ...viewport}]},
    ];
    const [err, _result] = await presult(
      executeRenders({
        setTransitioningIntoIE: () => {},
        timeItAsync: (_a, cb) => cb(),
        renderStories: async function(stories, _config) {
          if (counter === 0) {
            counter++;
            throw new Error('omg! something went wrong');
          } else {
            return stories;
          }
        },
        pagePool: {},
        stories,
        configs,
        logger: {
          verbose: () => {},
          log: () => {},
        },
        setRenderIE: () => {},
      }),
    );
    expect(err.message).to.equal('omg! something went wrong');
  });
});
