import {toXmlOutput} from '../../src/utils/format-results'
import assert from 'assert'

describe('format-result', () => {
  describe('XUnit XML', () => {
    it('works', () => {
      const testResults = [
        {
          name: 'someName1',
          appName: 'My Component | Button1',
          appUrls: {batch: 'https://eyes.com/results'},
        },
        {
          name: 'someName2',
          appName: 'My Component | Button2',
          appUrls: {batch: 'https://eyes.com/results'},
        },
      ]
      const expected = `<?xml version="1.0" encoding="UTF-8" ?>
<testsuite name="Eyes Test Suite" tests="2" time="10">
<testcase name="someName1">
</testcase>
<testcase name="someName2">
</testcase>
</testsuite>`

      assert.deepStrictEqual(toXmlOutput(testResults, {totalTime: 10}), expected)
    })
    it('works with 1 diff', () => {
      const testResults = [
        {
          status: 'Passed' as const,
          name: 'My Component | Button2',
          appUrls: {batch: 'https://eyes.com/results'},
        },
        {
          status: 'Unresolved' as const,
          isDifferent: true,
          name: 'My Component | Button1',
          appUrls: {batch: 'https://eyes.com/results'},
        },
      ]
      const expected = `<?xml version="1.0" encoding="UTF-8" ?>
<testsuite name="Eyes Test Suite" tests="2" time="10">
<testcase name="My Component | Button2">
</testcase>
<testcase name="My Component | Button1">
<failure>
Difference found. See https://eyes.com/results for details.
</failure>
</testcase>
</testsuite>`
      assert.deepStrictEqual(toXmlOutput(testResults, {totalTime: 10}), expected)
    })
    it('works with multiple diffs', () => {
      const testResults = [
        {
          status: 'Unresolved' as const,
          isDifferent: true,
          name: 'My Component | Button2',
          appUrls: {batch: 'https://eyes.com/results'},
        },
        {
          status: 'Unresolved' as const,
          isDifferent: true,
          name: 'My Component | Button1',
          appUrls: {batch: 'https://eyes.com/results'},
        },
      ]
      const expected = `<?xml version="1.0" encoding="UTF-8" ?>
<testsuite name="Eyes Test Suite" tests="2" time="10">
<testcase name="My Component | Button2">
<failure>
Difference found. See https://eyes.com/results for details.
</failure>
</testcase>
<testcase name="My Component | Button1">
<failure>
Difference found. See https://eyes.com/results for details.
</failure>
</testcase>
</testsuite>`
      assert.deepStrictEqual(toXmlOutput(testResults, {totalTime: 10}), expected)
    })
    it('works with no diffs', async () => {
      const testResults = [
        {
          status: 'Passed' as const,
          isDifferent: false,
          name: 'My Component | Button2',
          appUrls: {batch: 'https://eyes.com/results'},
        },
      ]
      const expected = `<?xml version="1.0" encoding="UTF-8" ?>
<testsuite name="Eyes Test Suite" tests="1" time="10">
<testcase name="My Component | Button2">
</testcase>
</testsuite>`
      assert.deepStrictEqual(toXmlOutput(testResults, {totalTime: 10}), expected)
    })
    it('works with no diffs and no succeeses', async () => {
      const testResults = []
      const expected = `<?xml version="1.0" encoding="UTF-8" ?>
<testsuite name="Eyes Test Suite" tests="0" time="0">
</testsuite>`
      assert.deepStrictEqual(toXmlOutput(testResults, {totalTime: 0}), expected)
    })
    it('displays duration if provided', async () => {
      const testResults = [
        {
          status: 'Passed' as const,
          isDifferent: false,
          name: 'My Component | Button2',
          duration: 10,
        },
      ]
      const expected = `<?xml version="1.0" encoding="UTF-8" ?>
<testsuite name="Eyes Test Suite" tests="1" time="20">
<testcase name="My Component | Button2" time="10">
</testcase>
</testsuite>`
      assert.deepStrictEqual(toXmlOutput(testResults, {totalTime: 20}), expected)
    })
    it('display properties if provided', async () => {
      const testResults = [
        {
          status: 'Passed' as const,
          isDifferent: false,
          name: 'My Component | Button3',
          hostApp: 'Chrome',
          hostDisplaySize: {width: 11, height: 21},
          appUrls: {batch: 'https://eyes.com/results'},
        },
        {
          status: 'Passed' as const,
          isDifferent: false,
          name: 'My Component | Button2',
          hostOS: 'Linux',
          hostApp: 'Chrome',
          hostDisplaySize: {width: 10, height: 20},
          appUrls: {batch: 'https://eyes.com/results'},
        },
      ]
      const expected = `<?xml version="1.0" encoding="UTF-8" ?>
<testsuite name="Eyes Test Suite" tests="2" time="20">
<testcase name="My Component | Button3">
<properties>
<property name="hostApp" value="Chrome"/>
<property name="viewportSize" value="11x21"/>
</properties>
</testcase>
<testcase name="My Component | Button2">
<properties>
<property name="hostOS" value="Linux"/>
<property name="hostApp" value="Chrome"/>
<property name="viewportSize" value="10x20"/>
</properties>
</testcase>
</testsuite>`
      assert.deepStrictEqual(toXmlOutput(testResults, {totalTime: 20}), expected)
    })
  })
})
