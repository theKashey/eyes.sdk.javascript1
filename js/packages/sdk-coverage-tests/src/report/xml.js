const convert = require('xml-js')
const {logDebug} = require('../log')

function convertJunitXmlToResultSchema({junit, browser, metadata}) {
  const tests = parseJunitXmlForTests(junit)

  logDebug(tests)

  const xmlTests = tests.reduce((acc, test) => {
    // console.log(test)
    const name = parseBareTestName(test._attributes.name)
    acc[name] = {
      ...test._attributes,
      skip: test.hasOwnProperty('skipped') || Number(test._attributes.time) === 0,
      failure: test.hasOwnProperty('failure') || !!test._attributes.failure,
    }
    return acc
  }, {})

  Object.entries(metadata).forEach(([key, value]) => {
    xmlTests[key] = {...value, skip: !xmlTests[key], ...xmlTests[key], name: value.name}
  })

  return Object.entries(xmlTests).map(([testName, testMeta]) => {
    const isSkipped = testMeta.skip || testMeta.skipEmit || false // we explicitly set false to preserve backwards compatibility
    return {
      test_name: testMeta.name || testName,
      parameters: {
        browser: browser || 'chrome',
        mode: testMeta.executionMode,
        api: testMeta.api,
      },
      passed: isSkipped ? undefined : !testMeta.failure,
      isGeneric: !!testMeta.isGeneric,
      isSkipped,
    }
  })
}

function parseBareTestName(testCaseName) {
  return testCaseName
    .replace(/Coverage Tests /, '')
    .replace(/\(.*\)/, '')
    .trim()
}

function parseJunitXmlForTests(xmlResult) {
  const jsonResult = JSON.parse(convert.xml2json(xmlResult, {compact: true, spaces: 2}))
  if (jsonResult.hasOwnProperty('testsuites')) {
    const testsuite = jsonResult.testsuites.testsuite
    return Array.isArray(testsuite)
      ? testsuite
          .map(suite => suite.testcase)
          .reduce((flatten, testcase) => flatten.concat(testcase), [])
      : Array.isArray(testsuite.testcase)
      ? testsuite.testcase
      : [testsuite.testcase]
  } else if (jsonResult.hasOwnProperty('testsuite')) {
    const testCase = jsonResult.testsuite.testcase
    return testCase.hasOwnProperty('_attributes') ? [testCase] : testCase
  } else throw new Error('Unsupported XML format provided')
}

module.exports = {
  convertJunitXmlToResultSchema,
  parseBareTestName,
  parseJunitXmlForTests,
}
