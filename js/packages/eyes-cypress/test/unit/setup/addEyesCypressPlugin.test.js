'use strict';

const {describe, it} = require('mocha');
const {expect} = require('chai');
const {addEyesCypressPlugin, pluginRequire} = require('../../../src/setup/addEyesCypressPlugin');
const fs = require('fs');
const path = require('path');

describe('addEyesCypressPlugin', () => {
  it('adds before other code', () => {
    const content = 'some.code();';
    expect(addEyesCypressPlugin(content)).to.equal(`some.code();${pluginRequire}`);
  });

  it('add after "use strict" and comments', () => {
    const content = `'use strict';
    
    // some comment
    // another comment

    some.code();

    module.exports = (on, config) => {
      return config;
    };

    `;

    const expected = `'use strict';
    
    // some comment
    // another comment

    some.code();

    module.exports = (on, config) => {
      return config;
    };

    ${pluginRequire}`;

    expect(addEyesCypressPlugin(content)).to.equal(expected);
  });

  it('configure eyes in setupNodeEvents', () => {
    const content = `const {defineConfig} = require('cypress');

    module.exports = defineConfig({
      chromeWebSecurity: true,
      video: false,
      screenshotOnRunFailure: false,
      defaultCommandTimeout: 86400000,
      eyesIsGlobalHooksSupported: false,
      eyesPort: 51664,
      e2e: {
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {

          on('before:run', async () => {
            console.log('@@@ before:run @@@');
            return null;
          });
        
          on('after:run', async () => {
            console.log('@@@ after:run @@@');
            return null;
          });
          
        },
      },
    });`;

    const expected = fs.readFileSync(
      path.resolve(process.cwd(), 'test/unit/setup/fixtures/pluginCypress10.js'),
      'utf-8',
    );

    expect(addEyesCypressPlugin(content)).to.equal(expected);
  });
});
