import {makeResource} from '../../src/resource'
import assert from 'assert'

describe('resource', () => {
  it('trims too big resources', async () => {
    const value = Buffer.alloc(37000000)
    const resource = makeResource({value, contentType: 'media/video'})

    assert.strictEqual(resource.value.length, 36075872 /* maximum allowed size of the resource */)
  })

  it('doesnt trim cdt', async () => {
    const value = Buffer.alloc(37000000)
    const resource = makeResource({value, contentType: 'x-applitools-html/cdt'})

    assert.strictEqual(resource.value.length, value.length)
  })
})
