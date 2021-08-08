'use strict'

const assert = require('assert')
const {getResourceAsText} = require('../../testUtils')

const {
  AppEnvironment,
  BatchInfo,
  SessionType,
  PropertyData,
  SessionStartInfo,
  ImageMatchSettings,
  MatchLevel,
  RectangleSize,
  FloatingMatchSettings,
  AccessibilityLevel,
  AccessibilityGuidelinesVersion,
  AccessibilityRegionType,
  AccessibilityMatchSettings,
} = require('../../../index')

describe('SessionStartInfo', () => {
  it('TestSerialization', () => {
    const properties = []
    properties.push(new PropertyData('property 1', 'value 1'))

    const batchInfo = new BatchInfo('some batch', new Date('2017-07-29T09:01:00.000Z'), 'someBatchId')
    const sessionStartInfo = new SessionStartInfo({
      agentId: 'agent',
      appIdOrName: 'some app',
      verId: '1.0',
      scenarioIdOrName: 'some test',
      batchInfo,
      baselineEnvName: 'baseline',
      environment: new AppEnvironment({
        os: 'windows',
        hostingApp: 'test suite',
        displaySize: new RectangleSize(234, 456),
        deviceInfo: 'Some Mobile Device',
      }),
      environmentName: 'some environment',
      defaultMatchSettings: new ImageMatchSettings({
        matchLevel: MatchLevel.Strict,
        accessibility: [
          new AccessibilityMatchSettings({
            left: 10,
            top: 20,
            width: 30,
            height: 40,
            type: AccessibilityRegionType.GraphicalObject,
          }),
        ],
        floating: [
          new FloatingMatchSettings({
            left: 22,
            top: 32,
            width: 42,
            height: 52,
            maxUpOffset: 5,
            maxDownOffset: 10,
            maxLeftOffset: 15,
            maxRightOffset: 20,
          }),
        ],
        accessibilitySettings: {
          level: AccessibilityLevel.AA,
          guidelinesVersion: AccessibilityGuidelinesVersion.WCAG_2_0,
        },
      }),
      branchName: 'some branch',
      parentBranchName: 'parent branch',
      baselineBranchName: 'baseline branch',
      sessionType: SessionType.SEQUENTIAL,
      displayName: 'display name',
      compareWithParentBranch: false,
      ignoreBaseline: false,
      render: false,
      saveDiffs: false,
      properties,
    })

    const actualSerialization = JSON.stringify(sessionStartInfo, null, 2)
    const expectedSerialization = getResourceAsText('SessionStartInfo_Serialization.json')
    assert.strictEqual(actualSerialization, expectedSerialization, 'SessionStartInfo serialization does not match!')
  })
})
