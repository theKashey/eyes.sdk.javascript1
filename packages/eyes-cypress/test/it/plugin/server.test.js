'use strict';
const {describe, it} = require('mocha');
const {expect} = require('chai');
const makeStartServer = require('../../../src/plugin/server');
const {makeLogger} = require('@applitools/logger');

const logger = makeLogger();

describe('plugin server', () => {
  it('starts at port 31077', async () => {
    const startServer = makeStartServer({logger});
    const {port, server} = await startServer();
    expect(port).to.equal(31077);
    await server.close();
  });

  it('starts at port 31078 if 31077 is already taken', async () => {
    const startServer = makeStartServer({logger});
    const {port, server} = await startServer();
    expect(port).to.equal(31077);

    const {port: port2, server: server2} = await startServer();
    expect(port2).to.equal(31078);
    await server.close();
    await server2.close();
  });
});
