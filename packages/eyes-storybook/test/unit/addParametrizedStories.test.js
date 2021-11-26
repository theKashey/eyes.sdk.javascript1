'use strict';
const {describe, it} = require('mocha');
const {expect} = require('chai');
const addParametrizedStories = require('../../src/addParametrizedStories');

describe('addRTLStories', () => {
  it('adds stories by array in global config', () => {
    const stories = [{name: 'aaa', kind: 'kuku'}, {name: 'bbb'}];
    const config = {variations: ['var1']};
    expect(addParametrizedStories({stories, config})).to.eql([
      {name: 'aaa', kind: 'kuku'},
      {name: 'bbb'},
      {
        name: 'aaa',
        kind: 'kuku',
        parameters: {eyes: {queryParam: {name: 'eyes-variation', value: 'var1'}}},
      },
      {name: 'bbb', parameters: {eyes: {queryParam: {name: 'eyes-variation', value: 'var1'}}}},
    ]);
  });

  it('adds stories by array in global config with local override', () => {
    const stories = [
      {name: 'aaa', kind: 'kuku'},
      {name: 'bbb', parameters: {eyes: {variations: ['var2']}}},
    ];
    const config = {variations: ['var1']};
    expect(addParametrizedStories({stories, config})).to.eql([
      {name: 'aaa', kind: 'kuku'},
      {name: 'bbb', parameters: {eyes: {variations: ['var2']}}},
      {
        name: 'aaa',
        kind: 'kuku',
        parameters: {eyes: {queryParam: {name: 'eyes-variation', value: 'var1'}}},
      },
      {
        name: 'bbb',
        parameters: {
          eyes: {variations: ['var2'], queryParam: {name: 'eyes-variation', value: 'var2'}},
        },
      },
    ]);
  });

  it('adds stories by function in global config', () => {
    const stories = [{name: 'aaa', kind: 'kuku'}, {name: 'bbb'}];
    const config = {variations: ({name}) => name === 'aaa' && ['var1', 'var2']};
    expect(addParametrizedStories({stories, config})).to.eql([
      {name: 'aaa', kind: 'kuku'},
      {name: 'bbb'},
      {
        name: 'aaa',
        kind: 'kuku',
        parameters: {eyes: {queryParam: {name: 'eyes-variation', value: 'var1'}}},
      },
      {
        name: 'aaa',
        kind: 'kuku',
        parameters: {eyes: {queryParam: {name: 'eyes-variation', value: 'var2'}}},
      },
    ]);
  });

  it('adds stories by function in global config with existing parameters', () => {
    const stories = [{name: 'aaa', kind: 'kuku', parameters: {}}, {name: 'bbb'}];
    const config = {variations: ({name}) => name === 'aaa' && ['var1', 'var2']};
    expect(addParametrizedStories({stories, config})).to.eql([
      {name: 'aaa', kind: 'kuku', parameters: {}},
      {name: 'bbb'},
      {
        name: 'aaa',
        kind: 'kuku',
        parameters: {eyes: {queryParam: {name: 'eyes-variation', value: 'var1'}}},
      },
      {
        name: 'aaa',
        kind: 'kuku',
        parameters: {eyes: {queryParam: {name: 'eyes-variation', value: 'var2'}}},
      },
    ]);
  });

  it('adds stories by function in global config with existing parameters that have eyes property', () => {
    const stories = [{name: 'aaa', kind: 'kuku', parameters: {eyes: {bla: 'bla'}}}, {name: 'bbb'}];
    const config = {variations: ({name}) => name === 'aaa' && ['var1', 'var2']};
    expect(addParametrizedStories({stories, config})).to.eql([
      {name: 'aaa', kind: 'kuku', parameters: {eyes: {bla: 'bla'}}},
      {name: 'bbb'},
      {
        name: 'aaa',
        kind: 'kuku',
        parameters: {eyes: {bla: 'bla', queryParam: {name: 'eyes-variation', value: 'var1'}}},
      },
      {
        name: 'aaa',
        kind: 'kuku',
        parameters: {eyes: {bla: 'bla', queryParam: {name: 'eyes-variation', value: 'var2'}}},
      },
    ]);
  });

  it('fails when global config has invalid variations', () => {
    const stories = [{name: 'aaa', bla: 'kuku'}, {name: 'bbb'}];
    const config = {variations: () => 'not an array'};
    expect(() => addParametrizedStories({stories, config})).to.throw(
      Error,
      `global variations should be a function that returns array`,
    );
  });

  it('adds variations by local parameter', () => {
    const stories = [
      {name: 'aaa', bla: 'kuku'},
      {name: 'bbb', kind: 'kuku', parameters: {eyes: {variations: ['rtl']}}},
    ];
    expect(addParametrizedStories({stories, config: {}})).to.eql([
      {name: 'aaa', bla: 'kuku'},
      {name: 'bbb', kind: 'kuku', parameters: {eyes: {variations: ['rtl']}}},
      {
        name: 'bbb',
        kind: 'kuku',
        parameters: {
          eyes: {variations: ['rtl'], queryParam: {name: 'eyes-variation', value: 'rtl'}},
        },
      },
    ]);
  });

  // this is important because of the optimization of __STORYBOOK_CLIENT_API__.setSelection, which avoids page reloads
  it('adds variations contiguously', () => {
    const stories = [
      {name: 'aaa', parameters: {eyes: {variations: ['v1', 'v2']}}},
      {name: 'bbb', parameters: {eyes: {variations: ['v1', 'v2']}}},
    ];

    expect(addParametrizedStories({stories, config: {}})).to.eql([
      {name: 'aaa', parameters: {eyes: {variations: ['v1', 'v2']}}},
      {name: 'bbb', parameters: {eyes: {variations: ['v1', 'v2']}}},
      {
        name: 'aaa',
        parameters: {
          eyes: {variations: ['v1', 'v2'], queryParam: {name: 'eyes-variation', value: 'v1'}},
        },
      },
      {
        name: 'bbb',
        parameters: {
          eyes: {variations: ['v1', 'v2'], queryParam: {name: 'eyes-variation', value: 'v1'}},
        },
      },
      {
        name: 'aaa',
        parameters: {
          eyes: {variations: ['v1', 'v2'], queryParam: {name: 'eyes-variation', value: 'v2'}},
        },
      },
      {
        name: 'bbb',
        parameters: {
          eyes: {variations: ['v1', 'v2'], queryParam: {name: 'eyes-variation', value: 'v2'}},
        },
      },
    ]);
  });
});
