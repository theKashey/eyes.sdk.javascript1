'use strict';
const {describe, it} = require('mocha');
const {expect} = require('chai');
const makeStartServer = require('../../../src/plugin/server');
const {makeLogger} = require('@applitools/logger');

const logger = makeLogger();

describe('plugin server', () => {
  it('starts at random port', async () => {
    const startServer = makeStartServer({logger});
    const {port, server} = await startServer();
    expect(port).to.not.undefined;
    await server.close();
  });

  it('start another server with random port', async () => {
    const startServer = makeStartServer({logger});
    const {port, server} = await startServer();
    expect(port).to.not.undefined;

    const {port: port2, server: server2} = await startServer();
    expect(port2).to.not.undefined;
    await server.close();
    await server2.close();
  });
});
