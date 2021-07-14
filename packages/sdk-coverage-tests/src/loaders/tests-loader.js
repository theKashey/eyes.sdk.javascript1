const path = require('path')
const babel = require('@babel/core')
const {
  isString,
  isUrl,
  isFunction,
  toPascalCase,
  mergeObjects,
  loadFile,
  runCode,
  requireUrl,
  isObject,
} = require('../common-util')
const {useFramework} = require('../framework')

function loadOverrides(overrides) {
  if (Array.isArray(overrides)) {
    return overrides.reduce((overrides, item) => overrides.concat(loadOverrides(item)), [])
  } else if (isString(overrides)) {
    const requiredOverrides = isUrl(overrides)
      ? requireUrl(overrides)
      : require(path.resolve(overrides))
    return [].concat(loadOverrides(requiredOverrides))
  } else {
    return [overrides]
  }
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
      return !!path.findParent(path => {
        if (path.isObjectMethod()) return path.node.key.name === 'test'
        if (path.isFunctionExpression()) return path.node.id.name === 'test'
      })
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
          if (operators[path.node.operator]) {
            path.replaceWith(
              t.callExpression(t.identifier(`this.operators.${operators[path.node.operator]}`), [
                path.node.left,
                path.node.right,
              ]),
            )
          }
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

async function testsLoader({
  tests: testsPath,
  overrides,
  ignoreSkip,
  ignoreSkipEmit,
  emitOnly = [],
}) {
  const {tests, testsConfig} = await loadTests(testsPath)
  const overrideTests = loadOverrides(overrides)
  const processedTests = Object.entries(tests).reduce((tests, [testName, {variants, ...test}]) => {
    test.group = testName
    test.key = test.key || toPascalCase(testName)
    test.name = testName
    if (variants) {
      Object.entries(variants).forEach(([variantName, variant]) => {
        variant.key = variant.key || test.key + toPascalCase(variantName)
        variant.name = variantName ? test.name + ' ' + variantName : test.name
        tests.push(mergeObjects(test, variant))
      })
    } else {
      tests.push(test)
    }
    return tests
  }, [])

  return processedTests.map(test => {
    const mergedTest = mergeObjects(
      test,
      ...overrideTests.map(overrideTests => {
        if (isFunction(overrideTests)) return overrideTests(test)
        else if (isObject(overrideTests)) return overrideTests[test.name]
      }),
    )
    return normalizeTest(mergedTest)
  })

  function normalizeTest(test) {
    test.page = test.page && testsConfig.pages[test.page]
    test.config = test.config || {}
    test.skip = test.skip && !ignoreSkip
    test.skipEmit = test.skipEmit && !ignoreSkipEmit
    if (!test.skipEmit) {
      if (isFunction(emitOnly)) {
        test.skipEmit = !emitOnly(test)
      } else if (emitOnly.length > 0) {
        test.skipEmit = !emitOnly.some(pattern => {
          if (pattern.startsWith('/') && pattern.endsWith('/')) {
            return new RegExp(pattern.slice(1, -1), 'i').test(test.name)
          }
          return test.name === pattern
        })
      }
    }
    return test
  }
}

exports.testsLoader = testsLoader
