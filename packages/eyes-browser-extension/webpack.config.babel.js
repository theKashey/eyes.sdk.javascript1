import path from 'path'
import webpack from 'webpack'
import CopyWebpackPlugin from 'copy-webpack-plugin'

const isProduction = process.env.NODE_ENV === 'production'

export default {
  mode: isProduction ? 'production' : 'development',
  context: __dirname,
  devtool: isProduction ? 'source-map' : false,
  node: {__dirname: true},
  entry: {
    content: ['./src/content'],
    background: ['./src/background'],
    api: ['./src/api'],
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
    publicPath: '/assets/',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      fs: require.resolve('./src/builtins/fs.js'),
      url: require.resolve('./src/builtins/url.js'),
      perf_hooks: require.resolve('./src/builtins/perf_hooks.js'),
      assert: require.resolve('assert/'),
      buffer: require.resolve('buffer/'),
      process: require.resolve('process/browser'),
      util: require.resolve('util/'),
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      zlib: require.resolve('browserify-zlib'),
      module: false,
      child_process: false,
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './manifest.json',
          to: './',
          transform: content => {
            const {version} = require('./package.json')
            return content.toString('utf8').replace(/__PACKAGE_VERSION__/g, version)
          },
        },
        {from: './assets', to: './assets'},
        {
          from: path.resolve(path.dirname(require.resolve('@applitools/dom-snapshot')), './dist/*.js'),
          to: './assets/dom-snapshot/[name].[ext]',
          filter: resourcePath => /(processPagePoll|pollResult)\.js$/.test(resourcePath),
        },
        {
          from: path.resolve(path.dirname(require.resolve('@applitools/dom-capture')), './dist/*.js'),
          to: './assets/dom-capture/[name].[ext]',
          filter: resourcePath => /(captureDomAndPoll|pollResult)\.js$/.test(resourcePath),
        },
      ],
    }),
    new webpack.ProvidePlugin({
      Buffer: [require.resolve('buffer'), 'Buffer'],
      process: [require.resolve('process/browser')],
      setImmediate: [require.resolve('core-js/features/set-immediate')],
    }),
  ],
}
