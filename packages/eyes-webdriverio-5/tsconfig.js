module.exports = {
  compilerOptions: {
    rootDir: 'src',
    outDir: 'dist',
    sourceMap: false,

    module: 'commonjs',
    target: 'es2017',
    noImplicitAny: true,
    preserveConstEnums: true,
    downlevelIteration: true,
    esModuleInterop: true,
    stripInternal: true,
    removeComments: true,
    typeRoots: ['./node_modules', './node_modules/@types', './types'],
    types: [
      'mocha',
      ...(['5', '6'].includes(process.env.APPLITOOLS_WEBDRIVERIO_MAJOR_VERSION)
        ? ['webdriverio', `v${process.env.APPLITOOLS_WEBDRIVERIO_MAJOR_VERSION}`]
        : ['webdriverio/async', 'v7']),
    ],
  },
  'ts-node': {
    transpileOnly: true,
  },
  exclude: ['dist', 'types', 'test'],
}
