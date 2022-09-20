import {toBaseCheckSettings} from '../../src/utils/to-base-check-settings'
import assert from 'assert'

describe('to-base-check-settings', () => {
  it('extracts and reconstruct coded regions element references', () => {
    const {elementReferencesToCalculate, getBaseCheckSettings} = toBaseCheckSettings({
      settings: {
        ignoreRegions: [
          {x: 0, y: 0, width: 10, height: 10},
          {region: {x: 1, y: 1, width: 11, height: 11}},
          {selector: 'region1'},
          {isElement: true},
        ],
        layoutRegions: undefined,
        strictRegions: [],
        contentRegions: [
          {region: {selector: 'region2'}, padding: 10},
          {region: {isElement: true}, regionId: 'region-id'},
        ],
        floatingRegions: [
          {x: 2, y: 2, width: 12, height: 12},
          {region: {isElement: true}, offset: {top: 20}},
        ],
        accessibilityRegions: [
          {x: 2, y: 2, width: 12, height: 12},
          {region: {isElement: true}, type: 'RegularText'},
          {region: {selector: 'region3'}, type: 'RegularText'},
        ],
      },
    })

    assert.deepStrictEqual(elementReferencesToCalculate, [
      {selector: 'region1'},
      {isElement: true},
      {selector: 'region2'},
      {isElement: true},
      {isElement: true},
      {isElement: true},
      {selector: 'region3'},
    ])

    const baseSettings = getBaseCheckSettings({
      calculatedRegions: [
        {selector: 'region1', regions: [{x: 101, y: 101, width: 101, height: 101}]},
        {selector: undefined, regions: [{x: 102, y: 102, width: 102, height: 102}]},
        {
          selector: 'region2',
          regions: [
            {x: 103, y: 103, width: 103, height: 103},
            {x: 104, y: 104, width: 104, height: 104},
          ],
        },
        {selector: undefined, regions: [{x: 105, y: 105, width: 105, height: 105}]},
        {selector: undefined, regions: []},
        {selector: undefined, regions: [{x: 106, y: 106, width: 106, height: 106}]},
        {selector: 'region3', regions: []},
      ],
    })

    assert.deepStrictEqual(baseSettings, {
      ignoreRegions: [
        {x: 0, y: 0, width: 10, height: 10},
        {region: {x: 1, y: 1, width: 11, height: 11}},
        {region: {x: 101, y: 101, width: 101, height: 101}, regionId: 'region1'},
        {region: {x: 102, y: 102, width: 102, height: 102}, regionId: undefined},
      ],
      layoutRegions: undefined,
      strictRegions: [],
      contentRegions: [
        {region: {x: 103, y: 103, width: 103, height: 103}, regionId: 'region2', padding: 10},
        {region: {x: 104, y: 104, width: 104, height: 104}, regionId: 'region2', padding: 10},
        {region: {x: 105, y: 105, width: 105, height: 105}, regionId: 'region-id'},
      ],
      floatingRegions: [{x: 2, y: 2, width: 12, height: 12}],
      accessibilityRegions: [
        {x: 2, y: 2, width: 12, height: 12},
        {region: {x: 106, y: 106, width: 106, height: 106}, type: 'RegularText', regionId: undefined},
      ],
    })
  })

  it('extract and removes crop region element reference', () => {
    const {getBaseCheckSettings} = toBaseCheckSettings({
      settings: {
        name: 'name',
        region: {selector: 'region1'},
      },
    })

    const baseSettings = getBaseCheckSettings({calculatedRegions: []})

    assert.deepStrictEqual(baseSettings, {name: 'name'})
  })

  it('preserves transformation settings', () => {
    const {getBaseCheckSettings} = toBaseCheckSettings({
      settings: {
        name: 'name',
        region: {x: 0, y: 0, width: 10, height: 10},
      },
    })

    const baseSettings = getBaseCheckSettings({calculatedRegions: [], preserveTransformation: true})

    assert.deepStrictEqual(baseSettings, {name: 'name', region: {x: 0, y: 0, width: 10, height: 10}})
  })
})
