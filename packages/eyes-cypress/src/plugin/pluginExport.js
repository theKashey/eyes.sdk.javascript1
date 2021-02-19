'use strict';
const setGlobalRunHooks = require('./hooks');

function makePluginExport({startServer, eyesConfig, visualGridClient, logger}) {
  return function pluginExport(pluginModule) {
    let closeEyesServer;
    const pluginModuleExports = pluginModule.exports;
    pluginModule.exports = async (...args) => {
      const {eyesPort, closeServer} = await startServer();
      closeEyesServer = closeServer;
      const moduleExportsResult = await pluginModuleExports(...args);
      const [on] = args;
      const eyesGlobalRunHooks = setGlobalRunHooks(on, {visualGridClient, logger});
      return Object.assign({}, eyesConfig, {eyesPort}, eyesGlobalRunHooks, moduleExportsResult);
    };
    return function getCloseServer() {
      return closeEyesServer;
    };
  };
}

module.exports = makePluginExport;
