module.exports = (on, _config) => {
  on('before:run', async () => {
    console.log('@@@ before:run @@@');
    return null;
  });

  on('after:run', async () => {
    console.log('@@@ after:run @@@');
    return null;
  });
};

// eslint-disable-next-line node/no-unpublished-require,node/no-missing-require
require('../../../../../..')(module);
