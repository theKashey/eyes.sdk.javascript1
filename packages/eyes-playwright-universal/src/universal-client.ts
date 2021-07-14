import type * as types from '@applitools/types'
import type {ChildProcess} from 'child_process'
import type {Driver, Context, Element, Selector} from './spec-driver'
import * as utils from '@applitools/utils'
import * as spec from './spec-driver'
import {spawn} from 'child_process'
import {Refer} from './refer'
import {Socket} from './socket'

type ClientSocket = Socket & types.ClientSocket<types.Ref<Driver>, types.Ref<Context>, types.Ref<Element>, Selector>

export class UniversalClient implements types.Core<Driver, Element, Selector> {
  private _socket: ClientSocket
  private _refer: Refer<Driver | Context | Element>
  private _server: ChildProcess

  constructor() {
    this._socket = new Socket()
    this._refer = new Refer((value: any): value is Driver | Context | Element => {
      return spec.isDriver(value) || spec.isContext(value) || spec.isElement(value)
    })
    this._server = spawn('node', ['./node_modules/@applitools/eyes-universal/dist/cli.js', '--port=2107'], {
      detached: true,
      stdio: ['ignore', 'pipe', 'ignore'],
    })

    // specific to JS: we are able to listen to stdout for the first line, then we know the server is up, and we even can get its port in case it wasn't passed
    this._server.stdout.once('data', data => {
      this._server.stdout.destroy()
      const [port] = String(data).split('\n', 1)
      this._socket.connect(`http://localhost:${port}/eyes`)
      this._socket.emit('Session.init', {commands: Object.keys(spec)})
    })

    // important: this allows the client process to exit without hanging, while the server process still runs
    this._server.unref()
    this._socket.unref()

    this._socket.command('Driver.isEqualElements', async ({context, element1, element2}) => {
      return spec.isEqualElements(this._refer.deref(context), this._refer.deref(element1), this._refer.deref(element2))
    })
    this._socket.command('Driver.executeScript', async ({context, script, arg}) => {
      const result = await spec.executeScript(this._refer.deref(context), script, this._refer.deref(arg))
      return this._refer.ref(result, context)
    })
    this._socket.command('Driver.mainContext', async ({context}) => {
      const mainContext = await spec.mainContext(this._refer.deref(context))
      return this._refer.ref(mainContext, context)
    })
    this._socket.command('Driver.parentContext', async ({context}) => {
      const parentContext = await spec.parentContext(this._refer.deref(context))
      return this._refer.ref(parentContext, context)
    })
    this._socket.command('Driver.childContext', async ({context, element}) => {
      const childContext = await spec.childContext(this._refer.deref(context), this._refer.deref(element))
      return this._refer.ref(childContext, context)
    })
    this._socket.command('Driver.findElement', async ({context, selector}) => {
      const element = await spec.findElement(this._refer.deref(context), selector)
      return !utils.types.isNull(element) ? this._refer.ref(element, context) : element
    })
    this._socket.command('Driver.findElements', async ({context, selector}) => {
      const elements = await spec.findElements(this._refer.deref(context), selector)
      return elements.map(element => this._refer.ref(element, context))
    })
    this._socket.command('Driver.takeScreenshot', async ({driver}) => {
      return spec.takeScreenshot(this._refer.deref(driver))
    })
    this._socket.command('Driver.getViewportSize', async ({driver}) => {
      return spec.getViewportSize(this._refer.deref(driver))
    })
    this._socket.command('Driver.setViewportSize', async ({driver, size}) => {
      return spec.setViewportSize(this._refer.deref(driver), size)
    })
    this._socket.command('Driver.getTitle', async ({driver}) => {
      return spec.getTitle(this._refer.deref(driver))
    })
    this._socket.command('Driver.getUrl', async ({driver}) => {
      return spec.getUrl(this._refer.deref(driver))
    })
    this._socket.command('Driver.visit', async ({driver, url}) => {
      return spec.visit(this._refer.deref(driver), url)
    })
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
    return new EyesManager({manager, refer: this._refer, socket: this._socket})
  }

  async getViewportSize({driver}: {driver: Driver}): Promise<types.Size> {
    const driverRef = this._refer.ref(driver)
    return this._socket.request('Core.getViewportSize', {
      driver: {...driverRef, context: this._refer.ref(spec.extractContext(driver), driverRef)},
    })
  }

  async setViewportSize({driver, size}: {driver: Driver; size: types.Size}): Promise<void> {
    const driverRef = this._refer.ref(driver)
    return this._socket.request('Core.setViewportSize', {
      driver: {...driverRef, context: this._refer.ref(spec.extractContext(driver), driverRef)},
      size,
    })
  }

  async closeBatches(options: any): Promise<void> {
    return this._socket.request('Core.closeBatch', options)
  }

  async deleteTest(options: any): Promise<void> {
    return this._socket.request('Core.deleteTest', options)
  }

  async checkSpecDriver({driver}: {driver: Driver}): Promise<any[]> {
    return this._socket.request('Debug.checkSpecDriver', {commands: Object.keys(spec), driver: this._refer.ref(driver)})
  }

  // for testing purposes
  async closeServer() {
    return this._server.kill()
  }
}

export class EyesManager implements types.EyesManager<Driver, Element, Selector> {
  private _manager: types.Ref
  private _socket: ClientSocket
  private _refer: Refer<Driver | Context | Element>

  constructor({manager, refer, socket}: any) {
    this._manager = manager
    this._refer = refer
    this._socket = socket
  }

  async openEyes({driver, config}: {driver: Driver; config?: types.EyesConfig<Element, Selector>}): Promise<Eyes> {
    const driverRef = this._refer.ref(driver)
    const eyes = await this._socket.request('EyesManager.openEyes', {
      manager: this._manager,
      driver: {...driverRef, context: this._refer.ref(spec.extractContext(driver), driverRef)},
      config: this._refer.ref(config),
    })
    return new Eyes({eyes, socket: this._socket, refer: this._refer})
  }

  async closeAllEyes(): Promise<types.TestResult[]> {
    return this._socket.request('EyesManager.closeAllEyes', {manager: this._manager})
  }
}

// not to be confused with the user-facing Eyes class
export class Eyes implements types.Eyes<Element, Selector> {
  private _eyes: types.Ref
  private _socket: ClientSocket
  private _refer: Refer<Driver | Context | Element>

  constructor({eyes, socket, refer}: any) {
    this._eyes = eyes
    this._socket = socket
    this._refer = refer
  }

  check({
    settings,
    config,
  }: {
    settings: types.CheckSettings<Element, Selector>
    config?: types.EyesConfig<Element, Selector>
  }): Promise<types.MatchResult> {
    return this._socket.request('Eyes.check', {
      eyes: this._eyes,
      settings: this._refer.ref(settings, this._eyes),
      config: this._refer.ref(config, this._eyes),
    })
  }

  locate<TLocator extends string>({
    settings,
    config,
  }: {
    settings: types.LocateSettings<TLocator>
    config?: types.EyesConfig<Element, Selector>
  }): Promise<Record<TLocator, types.Region[]>> {
    return this._socket.request('Eyes.locate', {
      eyes: this._eyes,
      settings,
      config: this._refer.ref(config, this._eyes),
    })
  }

  extractTextRegions<TPattern extends string>({
    settings,
    config,
  }: {
    settings: types.OCRSearchSettings<TPattern>
    config?: types.EyesConfig<Element, Selector>
  }): Promise<Record<TPattern, types.TextRegion[]>> {
    return this._socket.request('Eyes.extractTextRegions', {
      eyes: this._eyes,
      settings,
      config: this._refer.ref(config, this._eyes),
    })
  }

  extractText({
    regions,
    config,
  }: {
    regions: types.OCRExtractSettings<Element, Selector>[]
    config?: types.EyesConfig<Element, Selector>
  }): Promise<string[]> {
    return this._socket.request('Eyes.extractText', {
      eyes: this._eyes,
      regions: this._refer.ref(regions),
      config: this._refer.ref(config),
    })
  }

  close() {
    return this._socket.request('Eyes.close', {eyes: this._eyes})
  }

  abort() {
    return this._socket.request('Eyes.abort', {eyes: this._eyes})
  }
}
