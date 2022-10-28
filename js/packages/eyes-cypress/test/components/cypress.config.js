const webpackConfig = require('./webpack.config.js');

module.exports = {
  video: false,
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: webpackConfig,
    },
  },
};
require('../../')(module);
