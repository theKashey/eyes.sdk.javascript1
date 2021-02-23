'use strict';

const {getEyesConfig} = require('./config');
const setGlobalHooks = require('./hooks');

function makePluginExport({startServer, runConfig, visualGridClient, logger}) {
  return function pluginExport(pluginModule) {
    let closeEyesServer;
    const pluginModuleExports = pluginModule.exports;
    pluginModule.exports = async (...args) => {
      const {eyesPort, closeServer} = await startServer();
      closeEyesServer = closeServer;
      const moduleExportsResult = await pluginModuleExports(...args);
      setGlobalHooks(...args, {visualGridClient, logger});
      const eyesConfig = getEyesConfig(runConfig);
      return Object.assign(eyesConfig, {eyesPort}, moduleExportsResult);
    };
    return function getCloseServer() {
      return closeEyesServer;
    };
  };
}

module.exports = makePluginExport;
