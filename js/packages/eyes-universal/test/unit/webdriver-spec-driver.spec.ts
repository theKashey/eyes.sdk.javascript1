import {getWorlds} from '../../src/spec-driver/webdriver'
import assert from 'assert'

describe('webdriver spec driver', () => {
  it('getWorlds(standard return type)', async () => {
    const driver = {
      getContexts: async (): Promise<any[]> => ['asdf', 'jkl'],
    }
    assert.deepStrictEqual(await getWorlds(driver), ['asdf', 'jkl'])
  })
  it('getWorlds(object return type)', async () => {
    const driver = {
      getContexts: async (): Promise<any[]> => [{id: 'asdf'}, {id: 'jkl'}],
    }
    assert.deepStrictEqual(await getWorlds(driver), ['asdf', 'jkl'])
  })
})
