const path = require('path')
const babel = require('@babel/core')
const {
  isString,
  isUrl,
  toPascalCase,
  mergeObjects,
  loadFile,
  runCode,
  requireUrl,
} = require('../common-util')
const {useFramework} = require('../framework')

function loadOverrides(overrides) {
  if (Array.isArray(overrides)) {
    return overrides.reduce((overrides, item) => Object.assign(overrides, loadOverrides(item)), {})
  }

  if (!isString(overrides)) return overrides
  return isUrl(overrides) ? requireUrl(overrides) : require(path.join(path.resolve('.'), overrides))
}

async function loadTests(path) {
  const code = transformTests(loadFile(path))
  const {context, api} = useFramework()
  runCode(code, api)
  return context
}

function transformTests(code) {
  const transformer = ({types: t}) => {
    const isTransformable = path => {
      return !!path.findParent(path => path.isObjectMethod() && path.node.key.name === 'test')
    }
    const operators = {
      '+': 'add',
      '-': 'sub',
      '*': 'mul',
      '/': 'div',
      '**': 'pow',
    }
    return {
      visitor: {
        BinaryExpression(path) {
          if (!isTransformable(path)) return
          if (operators[path.node.operator])
            path.replaceWith(
              t.callExpression(t.identifier(`this.operators.${operators[path.node.operator]}`), [
                path.node.left,
                path.node.right,
              ]),
            )
        },
        VariableDeclarator(path) {
          if (!path.node.init) return
          if (!isTransformable(path)) return
          if (!path.node.id.name) return
          path.node.init = t.callExpression(t.identifier('this.ref'), [
            t.stringLiteral(path.node.id.name),
            path.node.init,
          ])
        },
      },
    }
  }

  const transformed = babel.transformSync(code, {plugins: [transformer]})
  return transformed.code
}

async function testsLoader({tests: testsPath, overrides, ignoreSkip, ignoreSkipEmit}) {
  const {tests, testsConfig} = await loadTests(testsPath)
  const overrideTests = loadOverrides(overrides)
  const normalizedTests = Object.entries(tests).reduce((tests, [testName, {variants, ...test}]) => {
    test.group = testName
    test.key = test.key || toPascalCase(testName)
    test.name = testName
    if (variants) {
      Object.entries(variants).forEach(([variantName, variant]) => {
        variant.key = variant.key || test.key + toPascalCase(variantName)
        variant.name = variantName ? test.name + ' ' + variantName : test.name
        const testVariant = mergeObjects(test, variant, overrideTests[variant.name])
        tests.push(normalizeTest(testVariant))
      })
    } else {
      tests.push(normalizeTest(mergeObjects(test, overrideTests[test.name])))
    }
    return tests
  }, [])

  return normalizedTests

  function normalizeTest(test) {
    test.config = test.config || {}
    test.skip = test.skip && !ignoreSkip
    test.skipEmit = test.skipEmit && !ignoreSkipEmit
    test.page = test.page && testsConfig.pages[test.page]
    return test
  }
}

function filterTests(tests, {emitOnly = [], emitSkipped, ignoreSkipEmit}) {
  if (emitOnly.length > 0) {
    return tests.filter(test => {
      return emitOnly.some(pattern => {
        if (pattern.startsWith('/') && pattern.endsWith('/')) {
          const regexp = new RegExp(pattern.slice(1, -1), 'i')
          return regexp.test(test.name)
        }
        return test.name === pattern
      })
    })
  } else {
    return tests.filter(test => {
      return (ignoreSkipEmit || !test.skipEmit) && (emitSkipped || !test.skip)
    })
  }
}

exports.testsLoader = testsLoader
exports.filterTests = filterTests
