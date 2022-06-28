import assert from 'assert'
import * as utils from '@applitools/utils'
import * as specUtils from '../../src/spec-utils'

describe('spec utils', () => {
  it('withFastCache works', async () => {
    let counter = 0
    const spec = specUtils.withFastCache({
      async getElementRegion(_driver: unknown, _element: unknown) {
        await utils.general.sleep(100)
        return {x: counter++, y: 0, width: 0, height: 0}
      },
    } as any)

    const region1 = await spec.getElementRegion(null, null)
    const region2 = await spec.getElementRegion(null, null)
    await utils.general.sleep(1)
    const region3 = await spec.getElementRegion(null, null)
    assert.deepStrictEqual(region1, region2)
    assert.notDeepStrictEqual(region2, region3)
  })
})
