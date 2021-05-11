module.exports = {
  compilerOptions: {
    rootDir: 'src',
    outDir: 'dist',
    sourceMap: true,

    target: 'ES2017',
    module: 'commonjs',
    noImplicitAny: true,
    removeComments: true,
    preserveConstEnums: true,
    downlevelIteration: true,
    stripInternal: true,
    experimentalDecorators: false,
    resolveJsonModule: true,
    typeRoots: ['./node_modules', './node_modules/@types', './types'],
    types: ['5', '6'].includes(process.env.APPLITOOLS_WEBDRIVERIO_MAJOR_VERSION)
      ? ['webdriverio', `v${process.env.APPLITOOLS_WEBDRIVERIO_MAJOR_VERSION}`]
      : ['webdriverio/async', 'v7'],
  },
  include: ['./src/**/*'],
}
