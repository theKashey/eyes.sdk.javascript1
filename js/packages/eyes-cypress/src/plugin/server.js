'use strict';
const connectSocket = require('./webSocket');
const {makeServerProcess} = require('@applitools/eyes-universal');
const handleTestResults = require('./handleTestResults');
const path = require('path');
const fs = require('fs');
const semverLt = require('semver/functions/lt');
const {Server: HttpsServer} = require('https');
const {Server: WSServer} = require('ws');
const which = require('which');

function makeStartServer({logger}) {
  return async function startServer() {
    const key = fs.readFileSync(path.resolve(__dirname, '../pem/server.key'));
    const cert = fs.readFileSync(path.resolve(__dirname, '../pem/server.cert'));
    let port;

    const https = new HttpsServer({
      key,
      cert,
    });
    await https.listen(0, err => {
      if (err) {
        logger.log('error starting plugin server', err);
      } else {
        logger.log(`plugin server running at port: ${https.address().port}`);
        port = https.address().port;
      }
    });

    const wss = new WSServer({server: https, path: '/eyes', maxPayload: 254 * 1024 * 1024});

    wss.on('close', () => https.close());

    const forkOptions = {
      detached: true,
    };

    const cypressVersion = require('cypress/package.json').version;

    // `cypress` version below `7.0.0` has an old Electron version which not support async shell process.
    // By passing `execPath` with the node process cwd it will switch the `node` process to be the like the OS have
    // and will not use the unsupported `Cypress Helper.app` with the not supported shell process Electron
    if (semverLt(cypressVersion, '7.0.0')) {
      forkOptions.execPath = await which('node');
    }

    const {port: universalPort, close: closeUniversalServer} = await makeServerProcess({
      key: path.resolve(__dirname, '../pem/server.key'),
      cert: path.resolve(__dirname, '../pem/server.cert'),
      idleTimeout: 0,
      shutdownMode: 'stdin',
      forkOptions,
    });

    const managers = [];
    let socketWithUniversal;

    wss.on('connection', socketWithClient => {
      socketWithUniversal = connectSocket(`wss://localhost:${universalPort}/eyes`);

      socketWithUniversal.setPassthroughListener(message => {
        logger.log('<== ', message.toString().slice(0, 1000));
        const {name, payload} = JSON.parse(message);
        if (name === 'Core.makeManager') {
          managers.push({manager: payload.result, socketWithUniversal});
        }

        socketWithClient.send(message.toString());
      });

      socketWithClient.on('message', message => {
        const msg = JSON.parse(message);
        logger.log('==> ', message.toString().slice(0, 1000));
        if (msg.name === 'Core.makeSDK') {
          const newMessage = Buffer.from(
            JSON.stringify({
              name: msg.name,
              key: msg.key,
              payload: Object.assign(msg.payload, {cwd: process.cwd()}),
            }),
            'utf-8',
          );
          socketWithUniversal.send(newMessage);
        } else if (msg.name === 'Test.printTestResults') {
          try {
            if (msg.payload.resultConfig.tapDirPath) {
              handleTestResults.handleBatchResultsFile(msg.payload.testResults, {
                tapFileName: msg.payload.resultConfig.tapFileName,
                tapDirPath: msg.payload.resultConfig.tapDirPath,
              });
            }
            handleTestResults.printTestResults({
              testResults: msg.payload.testResults,
              resultConfig: msg.payload.resultConfig,
            });
            socketWithClient.send(
              JSON.stringify({
                name: 'Test.printTestResults',
                key: msg.key,
                payload: {result: 'success'},
              }),
            );
          } catch (ex) {
            socketWithClient.send(
              JSON.stringify({
                name: 'Test.printTestResults',
                key: msg.key,
                payload: {result: ex.message.toString()},
              }),
            );
          }
        } else {
          socketWithUniversal.send(message);
        }
      });
    });

    return {
      server: wss,
      port,
      closeManager,
      closeBatches,
      closeUniversalServer,
    };

    function closeManager() {
      return Promise.all(
        managers.map(({manager, socketWithUniversal}) =>
          socketWithUniversal.request('EyesManager.closeManager', {
            manager,
            throwErr: false,
          }),
        ),
      );
    }
    function closeBatches(settings) {
      if (socketWithUniversal)
        return socketWithUniversal.request('Core.closeBatches', {settings}).catch(err => {
          logger.log('@@@', err);
        });
    }
  };
}

module.exports = makeStartServer;
