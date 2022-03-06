import type * as types from '@applitools/types'
import type {ChildProcess} from 'child_process'
import type {Driver, Element, Selector, TransformedDriver, TransformedElement, TransformedSelector} from './spec-driver'
import * as utils from '@applitools/utils'
import * as spec from './spec-driver'
import {spawn} from 'child_process'
import {Socket} from './socket'

// TODO add logger to keep track of the requests

type ClientSocket = Socket &
  types.ClientSocket<TransformedDriver, TransformedDriver, TransformedElement, TransformedSelector>

export class UniversalClient implements types.Core<Driver, Element, Selector> {
  private _server: ChildProcess
  private _socket: ClientSocket

  constructor() {
    this._socket = new Socket()
    // TODO change to ./node_modules/.bin/eyes-universal
    this._server = spawn(`node`, ['./node_modules/@applitools/eyes-universal/dist/cli.js'], {
      detached: true,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    // specific to JS: we are able to listen to stdout for the first line, then we know the server is up, and we even can get its port in case it wasn't passed
    this._server.stdout.once('data', data => {
      ;(this._server.stdout as any).unref()
      const [port] = String(data).split('\n', 1)
      this._socket.connect(`http://localhost:${port}/eyes`)
      this._socket.emit('Core.makeSDK', {
        name: 'eyes.selenium',
        version: require('../package.json').version,
        protocol: 'webdriver',
        cwd: process.cwd(),
      })
    })
    // important: this allows the client process to exit without hanging, while the server process still runs
    this._server.unref()
    this._socket.unref()
  }

  isDriver(driver: any): driver is Driver {
    return spec.isDriver(driver)
  }

  isElement(element: any): element is Element {
    return spec.isElement(element)
  }

  isSelector(selector: any): selector is Selector {
    return spec.isSelector(selector)
  }

  async makeManager(config?: types.EyesManagerConfig): Promise<EyesManager> {
    const manager = await this._socket.request('Core.makeManager', config)

    return new EyesManager({manager, socket: this._socket})
  }

  async getViewportSize({driver}: {driver: Driver}): Promise<types.Size> {
    return this._socket.request('Core.getViewportSize', {
      driver: await transform(driver),
    })
  }

  async setViewportSize({driver, size}: {driver: Driver; size: types.Size}): Promise<void> {
    return this._socket.request('Core.setViewportSize', {
      driver: await transform(driver),
      size,
    })
  }

  async closeBatches(options: any): Promise<void> {
    return this._socket.request('Core.closeBatch', options)
  }

  async deleteTest(options: any): Promise<void> {
    return this._socket.request('Core.deleteTest', options)
  }

  // for testing purposes
  async closeServer() {
    return this._server.kill()
  }
}

export class EyesManager implements types.EyesManager<Driver, Element, Selector> {
  private _manager: types.Ref
  private _socket: ClientSocket

  constructor({manager, socket}: any) {
    this._manager = manager
    this._socket = socket
  }

  async openEyes({driver, config}: {driver: Driver; config?: types.EyesConfig<Element, Selector>}): Promise<Eyes> {
    const eyes = await this._socket.request('EyesManager.openEyes', {
      manager: this._manager,
      driver: await transform(driver),
      config: await transform(config),
    })
    return new Eyes({eyes, socket: this._socket})
  }

  async closeManager({throwErr}: {throwErr: boolean}): Promise<types.TestResultSummary> {
    return this._socket.request('EyesManager.closeManager', {manager: this._manager, throwErr})
  }
}

// not to be confused with the user-facing Eyes class
export class Eyes implements types.Eyes<Element, Selector> {
  private _eyes: types.Ref
  private _socket: ClientSocket

  constructor({eyes, socket}: any) {
    this._eyes = eyes
    this._socket = socket
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
      settings: await transform(settings),
      config: await transform(config),
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
      config: await transform(config),
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
      config: await transform(config),
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
      regions: await transform(regions),
      config: await transform(config),
    })
  }

  close(options: {throwErr: boolean}): Promise<types.TestResult[]> {
    return this._socket.request('Eyes.close', {eyes: this._eyes, throwErr: options.throwErr})
  }

  abort(): Promise<types.TestResult[]> {
    return this._socket.request('Eyes.abort', {eyes: this._eyes})
  }
}

async function transform(data: any): Promise<any> {
  if (spec.isDriver(data)) {
    return spec.transformDriver(data)
  } else if (spec.isElement(data)) {
    return spec.transformElement(data)
  } else if (utils.types.isArray(data)) {
    return Promise.all(data.map(transform))
  } else if (utils.types.isObject(data)) {
    return Object.entries(data).reduce(async (data, [key, value]) => {
      const transformed = await transform(value)
      return data.then(data => Object.assign(data, {[key]: transformed}))
    }, Promise.resolve({}))
  } else {
    return data
  }
}
