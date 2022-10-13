import type {Size, Region} from '@applitools/utils'
import type {Core, EyesManager, Eyes} from '@applitools/core/types'
import {type DriverInfo, type Cookie} from '@applitools/driver'

type UnionToIntersection<TUnion> = (TUnion extends any ? (arg: TUnion) => any : never) extends (arg: infer TItem) => any
  ? TItem
  : never

type InputType<TFunc> = TFunc extends (arg: infer TArg) => any ? TArg : never
type OutputType<TFunc> = TFunc extends (...args: any) => infer TRes | Promise<infer TRes>
  ? Promise<Refify<TRes>>
  : never

type Request<
  TTarget extends {[key in keyof TTarget]: (...args: any) => any},
  TDomain extends string,
  TArg extends string = never,
  TName = keyof TTarget,
> = UnionToIntersection<
  TName extends string & keyof TTarget
    ? {
        request(
          name: `${TDomain}.${TName}`,
          options: InputType<TTarget[TName]> & {[key in TArg]: Ref<TTarget>},
        ): OutputType<TTarget[TName]>
      }
    : never
>

type Command<
  TTarget extends {[key in keyof TTarget]: (...args: any) => any},
  TDomain extends string,
  TArg extends string = never,
  TName = keyof TTarget,
> = UnionToIntersection<
  TName extends string & keyof TTarget
    ? {
        command(
          name: `${TDomain}.${TName}`,
          handler: (options: InputType<TTarget[TName]> & {[key in TArg]: Ref<TTarget>}) => OutputType<TTarget[TName]>,
        ): () => void
      }
    : never
>

interface Debug<TDriver, TContext, TElement, TSelector> {
  getHistory(): any
  checkSpecDriver(options: {
    driver: TDriver
    commands: (keyof UniversalSpecDriver<TDriver, TContext, TElement, TSelector>)[]
  }): any
}

interface Server {
  getInfo(): Record<string, any>
}

type UniversalCore<TDriver, TElement, TSelector> = Omit<
  Core<TDriver, TElement, TSelector>,
  'isDriver' | 'isElement' | 'isSelector'
>

type UniversalEyes<TDriver, TElement, TSelector, TType extends 'classic' | 'ufg'> = Omit<
  Eyes<TDriver, TElement, TSelector, TType>,
  'test' | 'running' | 'closed' | 'aborted'
>

// Ideally would be transform SpecDriver type to the type with single object argument
// but typescript doesn't have a possibility to convert named tuples to object types at the moment
export interface UniversalSpecDriver<TDriver, TContext, TElement, TSelector> {
  // #region UTILITY
  isEqualElements?(options: {context: TContext; element1: TElement; element2: TElement}): Promise<boolean>
  // #endregion

  // #region COMMANDS
  mainContext(options: {context: TContext}): Promise<TContext>
  parentContext?(options: {context: TContext}): Promise<TContext>
  childContext(options: {context: TContext; element: TElement}): Promise<TContext>
  executeScript(options: {context: TContext; script: string; arg?: any}): Promise<any>
  findElement(options: {context: TContext; selector: TSelector; parent?: TElement}): Promise<TElement | null>
  findElements(options: {context: TContext; selector: TSelector; parent?: TElement}): Promise<TElement[]>
  setWindowSize?(options: {driver: TDriver; size: Size}): Promise<void>
  getWindowSize?(options: {driver: TDriver}): Promise<Size>
  setViewportSize?(options: {driver: TDriver; size: Size}): Promise<void>
  getViewportSize?(options: {driver: TDriver}): Promise<Size>
  getCookies?(options: {driver: TDriver | TContext; context?: boolean}): Promise<Cookie[]>
  getDriverInfo?(options: {driver: TDriver}): Promise<DriverInfo>
  getCapabilities?(options: {driver: TDriver}): Promise<Record<string, any>>
  getTitle(options: {driver: TDriver}): Promise<string>
  getUrl(options: {driver: TDriver}): Promise<string>
  takeScreenshot(options: {driver: TDriver}): Promise<string>
  click?(options: {context: TContext; element: TElement | TSelector}): Promise<void>
  type?(options: {context: TContext; element: TElement; value: string}): Promise<void>
  visit?(options: {driver: TDriver; url: string}): Promise<void>
  // #endregion

  // #region MOBILE COMMANDS
  getOrientation?(options: {
    driver: TDriver
  }): Promise<'portrait' | 'landscape' | 'portrait-secondary' | 'landscape-secondary'>
  setOrientation?(options: {
    driver: TDriver
    orientation: 'portrait' | 'landscape' | 'portrait-secondary' | 'landscape-secondary'
  }): Promise<void>
  getSystemBars?(options: {driver: TDriver}): Promise<{
    statusBar: {visible: boolean; x: number; y: number; height: number; width: number}
    navigationBar: {visible: boolean; x: number; y: number; height: number; width: number}
  }>
  getElementRegion?(options: {driver: TDriver; element: TElement}): Promise<Region>
  getElementAttribute?(options: {driver: TDriver; element: TElement; attr: string}): Promise<string>
  getElementText?(options: {driver: TDriver; element: TElement}): Promise<string>
  performAction?(options: {driver: TDriver; steps: any[]}): Promise<void>
  getCurrentWorld?(options: {driver: TDriver}): Promise<string>
  getWorlds?(options: {driver: TDriver}): Promise<string[]>
  switchWorld?(options: {driver: TDriver; name: string}): Promise<void>
  // #endregion
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Ref<TValue = never> = {'applitools-ref-id': string; type?: string}

/* eslint-disable prettier/prettier */
export type Refify<TValue> = TValue extends string | number | boolean | null | undefined ? TValue
  : TValue extends Array<infer TItem> ? Refify<TItem>[]
  : Extract<TValue[keyof TValue], (...args: any) => any> extends never ? TValue
  : Ref<TValue>
/* eslint-enable prettier/prettier */

export type ClientSocket<TDriver, TContext, TElement, TSelector> = unknown &
  Request<UniversalCore<TDriver, TElement, TSelector>, 'Core'> &
  Request<EyesManager<TDriver, TElement, TSelector, 'classic' | 'ufg'>, 'EyesManager', 'manager'> &
  Request<UniversalEyes<TDriver, TElement, TSelector, 'classic' | 'ufg'>, 'Eyes', 'eyes'> &
  Request<Server, 'Server'> &
  Request<Debug<TDriver, TContext, TElement, TSelector>, 'Debug'> &
  Command<UniversalSpecDriver<TDriver, TContext, TElement, TSelector>, 'Driver'>

export type ServerSocket<TDriver, TContext, TElement, TSelector> = unknown &
  Command<UniversalCore<TDriver, TElement, TSelector>, 'Core'> &
  Command<EyesManager<TDriver, TElement, TSelector, 'classic' | 'ufg'>, 'EyesManager', 'manager'> &
  Command<UniversalEyes<TDriver, TElement, TSelector, 'classic' | 'ufg'>, 'Eyes', 'eyes'> &
  Command<Server, 'Server'> &
  Command<Debug<TDriver, TContext, TElement, TSelector>, 'Debug'> &
  Request<UniversalSpecDriver<TDriver, TContext, TElement, TSelector>, 'Driver'>
