'use strict';
const {makeHandler} = require('../../dist/plugin/handler');
const connectSocket = require('./webSocket');
const {makeServerProcess} = require('@applitools/eyes-universal');
const {TestResults} = require('@applitools/visual-grid-client');
const handleTestResults = require('./handleTestResults');

function makeStartServer({logger}) {
  return async function startServer() {
    const {server, port} = await makeHandler({singleton: false});

    const {port: universalPort, close: closeUniversalServer} = await makeServerProcess();

    const managers = [];
    let socketWithUniversal;

    server.on('connection', socketWithClient => {
      socketWithUniversal = connectSocket(`ws://localhost:${universalPort}/eyes`);

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
        if (msg.name === 'Test.printTestResults') {
          try {
            const resultArr = [];
            for (const result of msg.payload.testResults) {
              resultArr.push(new TestResults(result));
            }
            if (msg.payload.resultConfig.tapDirPath) {
              handleTestResults.handleBatchResultsFile(resultArr, {
                tapFileName: msg.payload.resultConfig.tapFileName,
                tapDirPath: msg.payload.resultConfig.tapDirPath,
              });
            }
            handleTestResults.printTestResults({
              testResults: resultArr,
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
      server,
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
