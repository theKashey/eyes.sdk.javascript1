module.exports = (on, _config) => {
  on('before:run', () => {
    console.log('@@@ before:run @@@');
    return null;
  });

  on('after:run', async () => {
    throw new Error('@@@ after:run error @@@');
  });
};

// eslint-disable-next-line node/no-unpublished-require,node/no-missing-require
require('../../../../../..')(module);
