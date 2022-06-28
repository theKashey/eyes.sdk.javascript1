import type * as types from '@applitools/types'
import type {ChildProcess} from 'child_process'
import type {Driver, Context, Element, Selector} from './spec-driver'
import * as utils from '@applitools/utils'
import * as spec from '@applitools/spec-driver-playwright'
import {spawn} from 'child_process'
import {Refer} from './refer'
import {Socket} from './socket'

type ClientSocket = types.ClientSocket<
  types.Ref<Driver>,
  types.Ref<Context>,
  types.Ref<Element>,
  types.Selector<types.Refify<Selector>>
> &
  Omit<Socket, 'command' | 'request'>

export class UniversalClient implements types.Core<Driver, Element, Selector> {
  private _socket: ClientSocket
  private _refer: Refer<Driver | Context | Element>
  private _server: ChildProcess

  constructor() {
    this._socket = new Socket()
    this._refer = new Refer((value: any): value is Driver | Context | Element => {
      return spec.isDriver(value) || spec.isContext(value) || spec.isElement(value)
    })
    this._server = spawn('node', ['./node_modules/@applitools/eyes-universal/dist/cli.js'], {
      detached: true,
      stdio: ['ignore', 'pipe', 'ignore'],
    })

    // specific to JS: we are able to listen to stdout for the first line, then we know the server is up, and we even can get its port in case it wasn't passed
    this._server.stdout.once('data', data => {
      ;(this._server.stdout as any).unref()
      const [port] = String(data).split('\n', 1)
      this._socket.connect(`http://localhost:${port}/eyes`)
      this._socket.emit('Core.makeSDK', {
        name: 'eyes.playwright',
        version: require('../package.json').version,
        commands: Object.keys(spec),
        cwd: process.cwd(),
      })
    })

    // important: this allows the client process to exit without hanging, while the server process still runs
    this._server.unref()
    this._socket.unref()

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
    this._socket.command('Driver.executeScript', async ({context, script, arg}) => {
      script = script.startsWith('function') ? `return (${script}).apply(null, arguments)` : script
      const result = await spec.executeScript(this._refer.deref(context), script, this._refer.deref(arg))
      return this._refer.ref(result, context)
    })
    this._socket.command('Driver.findElement', async ({context, selector, parent}) => {
      const element = await spec.findElement(
        this._refer.deref(context),
        spec.transformSelector(spec.transformSelector(this._refer.deref(selector))),
        this._refer.deref(parent),
      )
      return !utils.types.isNull(element) ? this._refer.ref(element, context) : element
    })
    this._socket.command('Driver.findElements', async ({context, selector, parent}) => {
      const elements = await spec.findElements(
        this._refer.deref(context),
        spec.transformSelector(spec.transformSelector(this._refer.deref(selector))),
        this._refer.deref(parent),
      )
      return elements.map(element => this._refer.ref(element, context))
    })
    this._socket.command('Driver.getViewportSize', async ({driver}) => {
      return spec.getViewportSize(this._refer.deref(driver))
    })
    this._socket.command('Driver.setViewportSize', async ({driver, size}) => {
      return spec.setViewportSize(this._refer.deref(driver), size)
    })
    this._socket.command('Driver.getCookies', async ({driver}) => {
      return spec.getCookies(this._refer.deref(driver))
    })
    this._socket.command('Driver.getDriverInfo', async ({driver}) => {
      return await spec.getDriverInfo(this._refer.deref(driver))
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
    this._socket.command('Driver.takeScreenshot', async ({driver}) => {
      const buffer = await spec.takeScreenshot(this._refer.deref(driver))
      return buffer.toString('base64')
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
      driver: {...driverRef, context: this._refer.ref(spec.extractContext(driver), driverRef)} as types.Ref<Driver>,
    })
  }

  async setViewportSize({driver, size}: {driver: Driver; size: types.Size}): Promise<void> {
    const driverRef = this._refer.ref(driver)
    return this._socket.request('Core.setViewportSize', {
      driver: {...driverRef, context: this._refer.ref(spec.extractContext(driver), driverRef)} as types.Ref<Driver>,
      size,
    })
  }

  async closeBatches(options: any): Promise<void> {
    return this._socket.request('Core.closeBatches', options)
  }

  async deleteTest(options: any): Promise<void> {
    return this._socket.request('Core.deleteTest', options)
  }

  async checkSpecDriver({driver}: {driver: Driver}): Promise<any[]> {
    return this._socket.request('Debug.checkSpecDriver', {
      commands: Object.keys(spec) as Exclude<
        keyof types.SpecDriver<Driver, Context, Element, Selector>,
        | 'isDriver'
        | 'isElement'
        | 'isSelector'
        | 'isContext'
        | 'extractContext'
        | 'extractSelector'
        | 'isStaleElementError'
        | 'transformDriver'
        | 'transformElement'
        | 'transformSelector'
      >[],
      driver: this._refer.ref(driver),
    })
  }

  // for testing purposes
  async closeServer() {
    return this._server.kill()
  }
}

export class EyesManager implements types.EyesManager<Driver, Element, Selector> {
  private _manager: types.Ref<any>
  private _socket: ClientSocket
  private _refer: Refer<Driver | Context | Element | Selector>

  constructor({manager, refer, socket}: any) {
    this._manager = manager
    this._refer = refer
    this._socket = socket
  }

  async openEyes({driver, config}: {driver: Driver; config?: types.EyesConfig<Element, Selector>}): Promise<Eyes> {
    const driverRef = this._refer.ref(driver)
    this._refer.ref(config).scrollRootElement
    const eyes = await this._socket.request('EyesManager.openEyes', {
      manager: this._manager,
      driver: {...driverRef, context: this._refer.ref(spec.extractContext(driver), driverRef)} as types.Ref<Driver>,
      config: this._refer.ref(config),
    })
    return new Eyes({eyes, socket: this._socket, refer: this._refer})
  }

  async closeManager({throwErr}: {throwErr?: boolean} = {}): Promise<types.TestResultSummary[]> {
    return this._socket.request('EyesManager.closeManager', {manager: this._manager, throwErr})
  }
}

// not to be confused with the user-facing Eyes class
export class Eyes implements types.Eyes<Element, Selector> {
  private _eyes: types.Ref<any>
  private _socket: ClientSocket
  private _refer: Refer<Driver | Context | Element | Selector>

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

  close({throwErr}: {throwErr?: boolean} = {}) {
    return this._socket.request('Eyes.close', {eyes: this._eyes, throwErr})
  }

  abort() {
    return this._socket.request('Eyes.abort', {eyes: this._eyes})
  }
}
