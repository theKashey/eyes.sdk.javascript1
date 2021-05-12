'use strict';
const setGlobalRunHooks = require('./hooks');
const shouldSetGlobalHooks = require('./shouldSetGlobalHooks');

function makePluginExport({startServer, eyesConfig, visualGridClient, logger}) {
  return function pluginExport(pluginModule) {
    let closeEyesServer;
    const pluginModuleExports = pluginModule.exports;
    pluginModule.exports = async (...args) => {
      const {eyesPort, closeServer} = await startServer();
      closeEyesServer = closeServer;
      const moduleExportsResult = await pluginModuleExports(...args);
      const [on, config] = args;

      if (shouldSetGlobalHooks({...config, ...eyesConfig})) {
        setGlobalRunHooks(on, {visualGridClient, logger, eyesConfig});
      }

      return Object.assign({}, eyesConfig, {eyesPort}, moduleExportsResult);
    };
    return function getCloseServer() {
      return closeEyesServer;
    };
  };
}

module.exports = makePluginExport;
