const fs = require('fs')
const path = require('path')
const typedoc = require('typedoc')
const prettier = require('prettier')
const dts = require('./dts')

function build({entry, out, tsconfig, externalModules, externalGlobals}) {
  const cwd = process.cwd()
  const td = new typedoc.Application()
  td.options.addReader(new typedoc.TSConfigReader())
  td.bootstrap({
    entryPoints: [path.resolve(cwd, entry)],
    tsconfig: path.resolve(cwd, tsconfig),
    disableSources: true,
    readme: 'none',
    categorizeByGroup: false,
    excludeInternal: true,
    excludeProtected: true,
    excludePrivate: true,
  })

  let context = null
  td.converter.on(typedoc.Converter.EVENT_CREATE_DECLARATION, ctx => {
    context = ctx.withScope()
  })

  const project = td.convert()

  const string = dts({project, context, externalModules, externalGlobals})

  const outPath = path.resolve(cwd, out)
  fs.mkdirSync(path.dirname(outPath), {recursive: true})
  fs.writeFileSync(
    outPath,
    prettier.format(string, {
      parser: 'typescript',
      printWidth: 120,
      singleQuote: true,
      semi: true,
      bracketSpacing: false,
      trailingComma: 'all',
    }),
  )
}

module.exports = build
