const fs = require('fs')
const path = require('path')
const {createReport, convertSdkNameToReportName} = require('../src/report/create')
const {
  parseBareTestName,
  parseJunitXmlForTests,
  convertJunitXmlToResultSchema,
} = require('../src/report/xml')
const assert = require('assert')

function loadFixture(fileName) {
  return fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures', fileName)), {
    encoding: 'utf-8',
  })
}

const junit = loadFixture('multiple-suites-multiple-tests.xml')
const metadata = {
  TestCheckWindow: {
    isGeneric: true,
    executionMode: 'css',
    name: 'test check window with css',
    api: 'classic',
  },
  TestCheckWindow_VG: {
    isGeneric: true,
    executionMode: 'visualgrid',
    name: 'test check window with vg',
    skip: true,
  },
  TestCheckWindow_Scroll: {
    isGeneric: true,
    executionMode: 'scroll',
    name: 'test check window with scroll',
    skip: true,
  },
  TestThatWasNotEmitted: {
    isGeneric: true,
    executionMode: 'bla',
    name: 'test that was not emitted',
    skipEmit: true,
  },
  TestThatWasEmittedButNotExecuted: {
    isGeneric: true,
    executionMode: 'bla',
    name: 'test that was emitted but not executed',
  },
}
describe('Report', () => {
  describe('JUnit XML Parser', () => {
    it('should throw if parsing an unsupported xml', () => {
      assert.throws(() => {
        parseJunitXmlForTests(`<?xml version="1.0" encoding="UTF-8"?>`)
      }, /Unsupported XML format provided/)
    })
    it('should support multiple suites with multiple tests', () => {
      const result = parseJunitXmlForTests(junit)
      assert(result[0].hasOwnProperty('_attributes'))
    })
    it('should support multiple suites with multiple tests at every suite', () => {
      const altXmlResult = loadFixture('multiple-suites-multiple-tests-each.xml')
      const result = parseJunitXmlForTests(altXmlResult)
      assert(result[0].hasOwnProperty('_attributes'))
    })
    it('should support multiple suites with one suite with multiple tests', () => {
      const altXmlResult = loadFixture('multiple-suites-multiple-tests-one.xml')
      const result = parseJunitXmlForTests(altXmlResult)
      assert(result[0].hasOwnProperty('_attributes'))
    })
    it('should support multiple suites with a single test', () => {
      const altXmlResult = loadFixture('multiple-suites-single-test.xml')
      const result = parseJunitXmlForTests(altXmlResult)
      assert(result[0].hasOwnProperty('_attributes'))
    })
    it('should support a single suite with a single test', () => {
      const altXmlResult = loadFixture('single-suite-single-test.xml')
      const result = parseJunitXmlForTests(altXmlResult)
      assert(result[0].hasOwnProperty('_attributes'))
    })
    it('should support a single suite with multiple tests', () => {
      const altXmlResult = loadFixture('single-suite-multiple-tests.xml')
      const result = parseJunitXmlForTests(altXmlResult)
      assert(result[0].hasOwnProperty('_attributes'))
    })
  })
  it('should parse the bare test name', () => {
    assert.deepStrictEqual(parseBareTestName('Coverage Tests TestCheckWindow'), 'TestCheckWindow')
    assert.deepStrictEqual(
      parseBareTestName('Coverage Tests Test Check Window'),
      'Test Check Window',
    )
    assert.deepStrictEqual(
      parseBareTestName(
        'TestCheckWindow_Fluent (screenshots: /Users/tourdedave/_dev/applitools/eyes.sdk.javascript1/packages/eyes-testcafe/screenshots/.applitools-abe4123e-d970-44da-8c3c-220fb9b47640/screenshot.png)',
      ),
      'TestCheckWindow_Fluent',
    )
  })
  it('should return the report test name', () => {
    assert.deepStrictEqual(convertSdkNameToReportName('eyes-selenium'), 'js_selenium_4')
    assert.deepStrictEqual(convertSdkNameToReportName('eyes-selenium-3'), 'js_selenium_3')
    assert.deepStrictEqual(convertSdkNameToReportName('eyes.webdriverio.javascript5'), 'js_wdio_5')
    assert.deepStrictEqual(convertSdkNameToReportName('eyes.webdriverio.javascript4'), 'js_wdio_4')
    assert.deepStrictEqual(convertSdkNameToReportName('eyes-images'), 'js_images')
  })
  it('should convert xml report to QA report schema as JSON', () => {
    const result = convertJunitXmlToResultSchema({junit, metadata})
    assert.deepStrictEqual(result, [
      {
        test_name: 'test check window with vg',
        parameters: {
          browser: 'chrome',
          mode: 'visualgrid',
          api: undefined,
        },
        passed: false,
        isSkipped: false,
        isGeneric: true,
      },
      {
        test_name: 'test check window with css',
        parameters: {
          browser: 'chrome',
          mode: 'css',
          api: 'classic',
        },
        passed: true,
        isSkipped: false,
        isGeneric: true,
      },
      {
        test_name: 'test check window with scroll',
        parameters: {
          browser: 'chrome',
          mode: 'scroll',
          api: undefined,
        },
        passed: true,
        isSkipped: false,
        isGeneric: true,
      },
      {
        test_name: 'test that was not emitted',
        parameters: {
          browser: 'chrome',
          mode: 'bla',
          api: undefined,
        },
        passed: undefined,
        isSkipped: true,
        isGeneric: true,
      },
      {
        test_name: 'test that was emitted but not executed',
        parameters: {
          browser: 'chrome',
          mode: 'bla',
          api: undefined,
        },
        passed: undefined,
        isSkipped: true,
        isGeneric: true,
      },
    ])
  })

  it('should create a report payload without id', () => {
    assert.deepStrictEqual(createReport({name: 'eyes-selenium', metadata, junit}), {
      sdk: 'js_selenium_4',
      group: 'selenium',
      sandbox: false,
      results: [
        {
          test_name: 'test check window with vg',
          parameters: {
            browser: 'chrome',
            mode: 'visualgrid',
            api: undefined,
          },
          passed: false,
          isSkipped: false,
          isGeneric: true,
        },
        {
          test_name: 'test check window with css',
          parameters: {
            browser: 'chrome',
            mode: 'css',
            api: 'classic',
          },
          passed: true,
          isSkipped: false,
          isGeneric: true,
        },
        {
          test_name: 'test check window with scroll',
          parameters: {
            browser: 'chrome',
            mode: 'scroll',
            api: undefined,
          },
          passed: true,
          isSkipped: false,
          isGeneric: true,
        },
        {
          test_name: 'test that was not emitted',
          parameters: {
            browser: 'chrome',
            mode: 'bla',
            api: undefined,
          },
          passed: undefined,
          isSkipped: true,
          isGeneric: true,
        },
        {
          test_name: 'test that was emitted but not executed',
          parameters: {
            browser: 'chrome',
            mode: 'bla',
            api: undefined,
          },
          passed: undefined,
          isSkipped: true,
          isGeneric: true,
        },
      ],
      id: undefined,
    })
  })

  it('should create a report payload with id', () => {
    assert.deepStrictEqual(
      createReport({reportId: '111111', name: 'eyes-selenium', metadata, junit}),
      {
        sdk: 'js_selenium_4',
        group: 'selenium',
        sandbox: false,
        results: [
          {
            test_name: 'test check window with vg',
            parameters: {
              browser: 'chrome',
              mode: 'visualgrid',
              api: undefined,
            },
            passed: false,
            isSkipped: false,
            isGeneric: true,
          },
          {
            test_name: 'test check window with css',
            parameters: {
              browser: 'chrome',
              mode: 'css',
              api: 'classic',
            },
            passed: true,
            isSkipped: false,
            isGeneric: true,
          },
          {
            test_name: 'test check window with scroll',
            parameters: {
              browser: 'chrome',
              mode: 'scroll',
              api: undefined,
            },
            passed: true,
            isSkipped: false,
            isGeneric: true,
          },
          {
            test_name: 'test that was not emitted',
            parameters: {
              browser: 'chrome',
              mode: 'bla',
              api: undefined,
            },
            passed: undefined,
            isSkipped: true,
            isGeneric: true,
          },
          {
            test_name: 'test that was emitted but not executed',
            parameters: {
              browser: 'chrome',
              mode: 'bla',
              api: undefined,
            },
            passed: undefined,
            isSkipped: true,
            isGeneric: true,
          },
        ],
        id: '111111',
      },
    )
  })

  it('should create a report with custom coverage tests', () => {
    const junit = loadFixture('multiple-suites-with-custom-tests.xml')
    const result = convertJunitXmlToResultSchema({junit, metadata})
    assert.deepStrictEqual(result, [
      {
        test_name: 'test check window with vg',
        parameters: {
          browser: 'chrome',
          mode: 'visualgrid',
          api: undefined,
        },
        passed: true,
        isSkipped: false,
        isGeneric: true,
      },
      {
        test_name: 'test check window with css',
        parameters: {
          browser: 'chrome',
          mode: 'css',
          api: 'classic',
        },
        passed: true,
        isSkipped: false,
        isGeneric: true,
      },
      {
        test_name: 'test check window with scroll',
        parameters: {
          browser: 'chrome',
          mode: 'scroll',
          api: undefined,
        },
        passed: true,
        isSkipped: false,
        isGeneric: true,
      },
      {
        test_name: 'some custom test',
        parameters: {
          api: undefined,
          browser: 'chrome',
          mode: undefined,
        },
        passed: false,
        isSkipped: false,
        isGeneric: false,
      },
      {
        test_name: 'test that was not emitted',
        parameters: {
          browser: 'chrome',
          mode: 'bla',
          api: undefined,
        },
        passed: undefined,
        isSkipped: true,
        isGeneric: true,
      },
      {
        test_name: 'test that was emitted but not executed',
        parameters: {
          browser: 'chrome',
          mode: 'bla',
          api: undefined,
        },
        passed: undefined,
        isSkipped: true,
        isGeneric: true,
      },
    ])
  })

  it('should handle skipped test with <skipped /> tag', () => {
    const junit = loadFixture('single-suite-skipped-test.xml')
    const results = convertJunitXmlToResultSchema({junit, metadata})
    assert.strictEqual(results[results.length - 1].isSkipped, true)
  })
})
