'use strict';

const setGlobalHooks = require('./hooks');
const {getEyesConfig} = require('./config');

function makePluginExport({startServer, config, visualGridClient, logger}) {
  return function pluginExport(pluginModule) {
    let closeEyesServer;
    const pluginModuleExports = pluginModule.exports;
    pluginModule.exports = async (...args) => {
      const {eyesPort, closeServer} = await startServer();
      closeEyesServer = closeServer;
      const moduleExportsResult = await pluginModuleExports(...args);
      const [on] = args;
      setGlobalHooks(on, config, {visualGridClient, logger});
      const eyesConfig = getEyesConfig(config);
      return Object.assign(eyesConfig, {eyesPort}, moduleExportsResult);
    };
    return function getCloseServer() {
      return closeEyesServer;
    };
  };
}

module.exports = makePluginExport;
