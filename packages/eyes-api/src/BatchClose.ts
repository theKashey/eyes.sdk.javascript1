import * as utils from '@applitools/utils'
import {ProxySettings} from './input/ProxySettings'

type BatchCloseOptions = {
  batchIds: string[]
  serverUrl?: string
  apiKey?: string
  proxy?: ProxySettings
}

type BatchCloseSpec = {
  closeBatches(options: {settings: BatchCloseOptions}): Promise<void>
}

export function closeBatch(spec: BatchCloseSpec): (options: BatchCloseOptions) => Promise<void> {
  return (settings: BatchCloseOptions) => {
    utils.guard.notNull(settings.batchIds, {name: 'options.batchIds'})
    return spec.closeBatches({settings})
  }
}

export class BatchClose {
  protected static readonly _spec: BatchCloseSpec
  protected get _spec(): BatchCloseSpec {
    return (this.constructor as typeof BatchClose)._spec
  }

  private _options: BatchCloseOptions = {batchIds: null}

  static async close(settings: BatchCloseOptions): Promise<void> {
    utils.guard.notNull(settings.batchIds, {name: 'options.batchIds'})
    await this._spec.closeBatches({settings})
  }

  constructor(options?: BatchCloseOptions) {
    if (options) this._options = options
  }

  async close(): Promise<void> {
    utils.guard.notNull(this._options.batchIds, {name: 'batchIds'})
    await this._spec.closeBatches({settings: this._options})
  }

  setBatchIds(batchIds: string[]): this {
    this._options.batchIds = batchIds
    return this
  }

  setUrl(serverUrl: string): this {
    this._options.serverUrl = serverUrl
    return this
  }

  setApiKey(apiKey: string): this {
    this._options.apiKey = apiKey
    return this
  }

  setProxy(proxy: ProxySettings): this {
    this._options.proxy = proxy
    return this
  }
}
