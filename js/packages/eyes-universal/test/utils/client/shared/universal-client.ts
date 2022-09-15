import type * as types from '@applitools/types'
import type {Socket} from './socket'
import type {Logger} from '@applitools/logger'
import type {CliType} from './spawn-server'
import {makeLogger} from '@applitools/logger'
import spawnServer from './spawn-server'

export type ClientSocket<TDriver, TContext, TElement, TSelector> = Socket &
  types.ClientSocket<TDriver, TContext, TElement, TSelector>

export type TransformFunc = (data: any) => Promise<any>

export class UniversalClient<Driver, Element, Selector> implements types.Core<Driver, Element, Selector> {
  protected _transform: TransformFunc
  // @TODO
  // should document the useage of the environment variable
  private _cliType: CliType = process.env.UNIVERSAL_CLIENT_CLI_TYPE as CliType

  private _socket: ClientSocket<Driver, Driver, Element, Selector>

  private _logger: Logger = makeLogger({label: 'universal client'})
  private async _getSocket() {
    if (!this._socket) {
      const {socket} = await spawnServer({logger: this._logger, cliType: this._cliType})
      this._socket = socket
    }
    return this._socket
  }

  async makeManager(config?: types.EyesManagerConfig): Promise<EyesManager<Driver, Element, Selector>> {
    const socket = await this._getSocket()
    const manager = await socket.request('Core.makeManager', config)

    return new EyesManager({manager, socket, transform: this._transform})
  }

  async getViewportSize({driver}: {driver: Driver}): Promise<types.Size> {
    const socket = await this._getSocket()
    return socket.request('Core.getViewportSize', {
      driver: await this._transform(driver),
    })
  }

  async setViewportSize({driver, size}: {driver: Driver; size: types.Size}): Promise<void> {
    const socket = await this._getSocket()
    return socket.request('Core.setViewportSize', {
      driver: await this._transform(driver),
      size,
    })
  }

  async closeBatches(options: any): Promise<void> {
    const socket = await this._getSocket()
    return socket.request('Core.closeBatch', options)
  }

  async deleteTest(options: any): Promise<void> {
    const socket = await this._getSocket()
    return socket.request('Core.deleteTest', options)
  }

  // not used, just to adhere to types.Core<Driver, Element, Selector>
  isDriver(driver: any): driver is Driver {
    return false
  }

  isElement(element: any): element is Element {
    return false
  }

  isSelector(selector: any): selector is Selector {
    return false
  }
}

export class EyesManager<Driver, Element, Selector> implements types.EyesManager<Driver, Element, Selector> {
  private _manager: types.Ref
  private _socket: ClientSocket<Driver, Driver, Element, Selector>
  private _transform: TransformFunc

  constructor({
    manager,
    socket,
    transform,
  }: {
    manager: types.Ref
    socket: ClientSocket<Driver, Driver, Element, Selector>
    transform: TransformFunc
  }) {
    this._manager = manager
    this._socket = socket
    this._transform = transform
  }

  async openEyes({
    driver,
    config,
  }: {
    driver: Driver
    config?: types.EyesConfig<Element, Selector>
  }): Promise<Eyes<Driver, Element, Selector>> {
    const eyes = await this._socket.request('EyesManager.openEyes', {
      manager: this._manager,
      driver: await this._transform(driver),
      config: await this._transform(config),
    })
    return new Eyes({eyes, socket: this._socket, transform: this._transform})
  }

  async closeManager(options?: {throwErr: boolean}): Promise<types.TestResultSummary> {
    return this._socket.request('EyesManager.closeManager', {manager: this._manager, throwErr: options?.throwErr})
  }
}

// not to be confused with the user-facing Eyes class
export class Eyes<Driver, Element, Selector> implements types.Eyes<Driver, Element, Selector> {
  private _eyes: types.Ref
  private _socket: ClientSocket<Driver, Driver, Element, Selector>
  private _transform: TransformFunc

  constructor({
    eyes,
    socket,
    transform,
  }: {
    socket: ClientSocket<Driver, Driver, Element, Selector>
    eyes: types.Ref
    transform: TransformFunc
  }) {
    this._eyes = eyes
    this._socket = socket
    this._transform = transform
  }

  async check({
    settings,
    config,
  }: {
    settings: types.CheckSettings<Element, Selector>
    config?: types.EyesConfig<Element, Selector>
  }): Promise<types.MatchResult> {
    return this._socket.request('Eyes.check', {
      eyes: this._eyes,
      settings: await this._transform(settings),
      config: await this._transform(config),
    })
  }

  async locate<TLocator extends string>({
    settings,
    config,
  }: {
    settings: types.LocateSettings<TLocator>
    config?: types.EyesConfig<Element, Selector>
  }): Promise<Record<TLocator, types.Region[]>> {
    return this._socket.request('Eyes.locate', {
      eyes: this._eyes,
      settings,
      config: await this._transform(config),
    })
  }

  async extractTextRegions<TPattern extends string>({
    settings,
    config,
  }: {
    settings: types.OCRSearchSettings<TPattern>
    config?: types.EyesConfig<Element, Selector>
  }): Promise<Record<TPattern, types.TextRegion[]>> {
    return this._socket.request('Eyes.extractTextRegions', {
      eyes: this._eyes,
      settings,
      config: await this._transform(config),
    })
  }

  async extractText({
    regions,
    config,
  }: {
    regions: types.OCRExtractSettings<Element, Selector>[]
    config?: types.EyesConfig<Element, Selector>
  }): Promise<string[]> {
    return this._socket.request('Eyes.extractText', {
      eyes: this._eyes,
      regions: await this._transform(regions),
      config: await this._transform(config),
    })
  }

  close(options: {throwErr: boolean}): Promise<types.TestResult[]> {
    return this._socket.request('Eyes.close', {eyes: this._eyes, throwErr: options.throwErr})
  }

  abort(): Promise<types.TestResult[]> {
    return this._socket.request('Eyes.abort', {eyes: this._eyes})
  }
}
