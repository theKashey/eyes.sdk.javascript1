const CYPRESS_SUPPORTED_VERSION = '6.2.0';
const CYPRESS_NO_FLAG_VERSION = '6.7.0';

function shouldSetGlobalHooks(config) {
  const {version, experimentalRunEvents} = config;

  return (
    version >= CYPRESS_NO_FLAG_VERSION ||
    (version >= CYPRESS_SUPPORTED_VERSION && !!experimentalRunEvents)
  );
}

module.exports = shouldSetGlobalHooks;
