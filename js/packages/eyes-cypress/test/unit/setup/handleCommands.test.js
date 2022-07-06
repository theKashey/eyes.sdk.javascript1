const {handlerCommandsCypress10} = require('../../../src/setup/handleCommands');
const commandsImport = require('../../../src/setup/addEyesCommands');
const fs = require('fs');
const {describe, it} = require('mocha');
const {expect} = require('chai');

describe('works with cypress 10 and supportFile', () => {
  it('works with supportFile config', () => {
    handlerCommandsCypress10(`${__dirname}/fixtures/cypressConfig-legacy-file`);
    const supportFileContent = fs.readFileSync(
      `${__dirname}/fixtures/cypressConfig-legacy-file/index.js`,
      'utf-8',
    );
    expect(supportFileContent).to.include(commandsImport.commandsImport);
  });
  afterEach(() => {
    fs.writeFileSync(`${__dirname}/fixtures/cypressConfig-legacy-file/index.js`, '', 'utf-8');
  });
});
