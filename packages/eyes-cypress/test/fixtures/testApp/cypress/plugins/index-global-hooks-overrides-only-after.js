module.exports = (on, _config) => {
  on('after:run', () => {
    console.log('@@@ after:run @@@');
    return null;
  });
};

// eslint-disable-next-line node/no-unpublished-require,node/no-missing-require
require('../../../../../..')(module);
