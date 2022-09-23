import type * as types from '@applitools/types'
import * as utils from '@applitools/utils'
import {ProxySettings} from './input/ProxySettings'

type BatchCloseOptions = {
  batchIds: string[]
  serverUrl: string
  apiKey: string
  proxy?: ProxySettings
}

type BatchCloseSpec = Pick<types.Core<unknown, unknown, unknown>, 'closeBatch'>

export function closeBatch(spec: BatchCloseSpec): (options: BatchCloseOptions) => Promise<void> {
  return (settings: BatchCloseOptions) => {
    utils.guard.notNull(settings.batchIds, {name: 'options.batchIds'})
    return spec.closeBatch({settings: settings.batchIds.map(batchId => ({batchId, ...settings}))})
  }
}

export class BatchClose {
  protected static readonly _spec: BatchCloseSpec
  protected get _spec(): BatchCloseSpec {
    return (this.constructor as typeof BatchClose)._spec
  }

  private _settings = {} as BatchCloseOptions

  static async close(settings: BatchCloseOptions): Promise<void> {
    utils.guard.notNull(settings.batchIds, {name: 'options.batchIds'})
    await this._spec.closeBatch({settings: settings.batchIds.map(batchId => ({batchId, ...settings}))})
  }

  constructor(options?: BatchCloseOptions) {
    if (options) this._settings = options
  }

  async close(): Promise<void> {
    utils.guard.notNull(this._settings.batchIds, {name: 'batchIds'})
    await this._spec.closeBatch({settings: this._settings.batchIds.map(batchId => ({batchId, ...this._settings}))})
  }

  setBatchIds(batchIds: string[]): this {
    this._settings.batchIds = batchIds
    return this
  }

  setUrl(serverUrl: string): this {
    this._settings.serverUrl = serverUrl
    return this
  }

  setApiKey(apiKey: string): this {
    this._settings.apiKey = apiKey
    return this
  }

  setProxy(proxy: ProxySettings): this {
    this._settings.proxy = proxy
    return this
  }
}
