'use strict';
const setGlobalRunHooks = require('./hooks');
const CYPRESS_SUPPORTED_VERSION = '6.2.0';

function makePluginExport({startServer, eyesConfig, visualGridClient, logger}) {
  return function pluginExport(pluginModule) {
    let closeEyesServer;
    const pluginModuleExports = pluginModule.exports;
    pluginModule.exports = async (...args) => {
      const {eyesPort, closeServer} = await startServer();
      closeEyesServer = closeServer;
      const moduleExportsResult = await pluginModuleExports(...args);
      const [on, config] = args;

      if (config.version >= CYPRESS_SUPPORTED_VERSION && config.experimentalRunEvents) {
        setGlobalRunHooks(on, {visualGridClient, logger});
        eyesConfig.eyesLegacyHooks = false;
      }

      return Object.assign({}, eyesConfig, {eyesPort}, moduleExportsResult);
    };
    return function getCloseServer() {
      return closeEyesServer;
    };
  };
}

module.exports = makePluginExport;
