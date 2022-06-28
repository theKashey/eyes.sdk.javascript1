import * as assert from 'assert'
import * as path from 'path'
import * as ts from 'typescript'
import transformer, {TransformerConfig} from '../../src/transformer'

type FileMapping = Record<string, string>

export function compile({config, input}: {config: TransformerConfig; input: FileMapping}): string {
  const options = {
    rootDir: path.resolve('.'),
    declarationDir: path.resolve('.'),
    declaration: true,
  }
  input = Object.fromEntries(Object.entries(input).map(([fileName, code]) => [path.resolve(fileName), code]))

  const host = ts.createCompilerHost(options)
  const originalGetSourceFile = host.getSourceFile.bind(host)
  host.getSourceFile = (fileName: string, languageVersion: ts.ScriptTarget, ...optionals: any[]) => {
    if (input[fileName]) return ts.createSourceFile(fileName, input[fileName], languageVersion)
    return originalGetSourceFile(fileName, languageVersion, ...optionals)
  }

  const program = ts.createProgram(Object.keys(input), options, host)

  const preEmitDiagnostics = ts.getPreEmitDiagnostics(program)
  assert.strictEqual(preEmitDiagnostics.length, 0, formatDiagnostics(preEmitDiagnostics))
  const declarationDiagnostics = program.getDeclarationDiagnostics()
  assert.strictEqual(declarationDiagnostics.length, 0, formatDiagnostics(declarationDiagnostics))

  const output = {} as FileMapping
  program.emit(
    /* targetSourceFile */ undefined,
    (fileName, data) => (output[path.relative(process.cwd(), fileName)] = data),
    /* cancellationToken */ undefined,
    /* emitOnlyDtsFiles */ true,
    {
      afterDeclarations: [transformer(program, config)],
    },
  )

  const outputFileNames = Object.keys(output)

  assert.strictEqual(outputFileNames.length, 1, `It expects 1 output file, but got ${outputFileNames.length}. File names: ${outputFileNames}`)

  return output[outputFileNames[0]]
}

function formatDiagnostics(diagnostics: ReadonlyArray<ts.Diagnostic>): string {
  const host = {
    getCanonicalFileName: (fileName: string) => (ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase()),
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
  }
  return ts.formatDiagnostics(diagnostics, host).trim()
}
