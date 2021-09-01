import {Region, Size, TextRegion, DriverInfo, MatchResult, TestResult} from './data'
import {EyesConfig, EyesManagerConfig} from './config'
import {
  CheckSettings,
  LocateSettings,
  OCRExtractSettings,
  OCRSearchSettings,
  CloseBatchesSettings,
  DeleteTestSettings,
} from './setting'
import {EyesManager, Eyes} from './core'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Ref<TValue = never> = {'applitools-ref-id': string}

export interface ClientSocket<TDriver, TContext, TElement, TSelector> {
  request(
    name: 'Core.makeManager',
    options?: EyesManagerConfig,
  ): Promise<Ref<EyesManager<TDriver, TElement, TSelector>>>

  request(name: 'Core.getViewportSize', options: {driver: TDriver}): Promise<Size>

  request(name: 'Core.setViewportSize', options: {driver: TDriver; size: Size}): Promise<void>

  request(name: 'Core.closeBatches', settings: CloseBatchesSettings): Promise<void>

  request(name: 'Core.deleteTest', settings: DeleteTestSettings): Promise<void>

  request(
    name: 'EyesManager.openEyes',
    options: {
      manager: Ref<EyesManager<TDriver, TElement, TSelector>>
      driver: TDriver
      config?: EyesConfig<TElement, TSelector>
      on?: (event: string, data?: Record<string, any>) => any
    },
  ): Promise<Ref<Eyes<TElement, TSelector>>>

  request(
    name: 'EyesManager.closeAllEyes',
    options: {manager: Ref<EyesManager<TDriver, TElement, TSelector>>; throwErr?: boolean},
  ): Promise<TestResult[]>

  request(
    name: 'Eyes.check',
    options: {
      eyes: Ref<Eyes<TElement, TSelector>>
      settings: CheckSettings<TElement, TSelector>
      config?: EyesConfig<TElement, TSelector>
    },
  ): Promise<MatchResult>

  request<TLocator extends string>(
    name: 'Eyes.locate',
    options: {
      eyes: Ref<Eyes<TElement, TSelector>>
      settings: LocateSettings<TLocator>
      config?: EyesConfig<TElement, TSelector>
    },
  ): Promise<Record<TLocator, Region[]>>

  request(
    name: 'Eyes.extractText',
    options: {
      eyes: Ref<Eyes<TElement, TSelector>>
      regions: OCRExtractSettings<TElement, TSelector>[]
      config?: EyesConfig<TElement, TSelector>
    },
  ): Promise<string[]>

  request<TPattern extends string>(
    name: 'Eyes.extractTextRegions',
    options: {
      eyes: Ref<Eyes<TElement, TSelector>>
      settings: OCRSearchSettings<TPattern>
      config?: EyesConfig<TElement, TSelector>
    },
  ): Promise<Record<TPattern, TextRegion[]>>

  request(
    name: 'Eyes.close',
    options: {eyes: Ref<Eyes<TElement, TSelector>>; throwErr?: boolean},
  ): Promise<TestResult[]>

  request(name: 'Eyes.abort', options: {eyes: Ref<Eyes<TElement, TSelector>>}): Promise<TestResult[]>

  command(
    name: 'Driver.isEqualElements',
    handler: (options: {context: TContext; element1: TElement; element2: TElement}) => Promise<boolean>,
  ): () => void

  command(name: 'Driver.mainContext', handler: (options: {context: TContext}) => Promise<TContext>): () => void

  command(name: 'Driver.parentContext', handler: (options: {context: TContext}) => Promise<TContext>): () => void

  command(
    name: 'Driver.childContext',
    handler: (options: {context: TContext; element: TElement}) => Promise<TContext>,
  ): () => void

  command(
    name: 'Driver.executeScript',
    handler: (options: {context: TContext; script: string; arg: any}) => Promise<any>,
  ): () => void

  command(
    name: 'Driver.findElement',
    handler: (options: {context: TContext; selector: TSelector}) => Promise<TElement | null>,
  ): () => void

  command(
    name: 'Driver.findElements',
    handler: (options: {context: TContext; selector: TSelector}) => Promise<TElement[]>,
  ): () => void

  command(
    name: 'Driver.click',
    handler: (options: {context: TContext; element: TElement | TSelector}) => Promise<void>,
  ): () => void

  command(name: 'Driver.getWindowSize', handler: (options: {driver: TDriver}) => Promise<Size>): () => void

  command(name: 'Driver.setWindowSize', handler: (options: {driver: TDriver; size: Size}) => Promise<void>): () => void

  command(name: 'Driver.getViewportSize', handler: (options: {driver: TDriver}) => Promise<Size>): () => void

  command(
    name: 'Driver.setViewportSize',
    handler: (options: {driver: TDriver; size: Size}) => Promise<void>,
  ): () => void

  command(name: 'Driver.getDriverInfo', handler: (options: {driver: TDriver}) => Promise<DriverInfo>): () => void

  command(name: 'Driver.getTitle', handler: (options: {driver: TDriver}) => Promise<string>): () => void

  command(name: 'Driver.getUrl', handler: (options: {driver: TDriver}) => Promise<string>): () => void

  command(name: 'Driver.takeScreenshot', handler: (options: {driver: TDriver}) => Promise<string>): () => void

  command(name: 'Driver.visit', handler: (options: {driver: TDriver; url: string}) => Promise<void>): () => void

  command(
    name: 'Driver.getOrientation',
    handler: (options: {driver: TDriver}) => Promise<'portrait' | 'landscape'>,
  ): () => void

  command(
    name: 'Driver.getElementRegion',
    handler: (options: {driver: TDriver; element: TElement}) => Promise<Region>,
  ): () => void

  command(
    name: 'Driver.getElementAttribute',
    handler: (options: {driver: TDriver; element: TElement; attr: string}) => Promise<string>,
  ): () => void

  command(
    name: 'Driver.getElementText',
    handler: (options: {driver: TDriver; element: TElement}) => Promise<string>,
  ): () => void

  command(
    name: 'Driver.performAction',
    handler: (options: {driver: TDriver; steps: any[]}) => Promise<void>,
  ): () => void
}

export interface ServerSocket<TDriver, TContext, TElement, TSelector> {
  request(
    name: 'Driver.isEqualElements',
    options: {context: TContext; element1: TElement; element2: TElement},
  ): Promise<boolean>

  request(name: 'Driver.mainContext', options: {context: TContext}): Promise<TContext>

  request(name: 'Driver.parentContext', options: {context: TContext}): Promise<TContext>

  request(name: 'Driver.childContext', options: {context: TContext; element: TElement}): Promise<TContext>

  request(name: 'Driver.executeScript', options: {context: TContext; script: string; arg: any}): Promise<any>

  request(name: 'Driver.findElement', options: {context: TContext; selector: TSelector}): Promise<TElement | null>

  request(name: 'Driver.findElements', options: {context: TContext; selector: TSelector}): Promise<TElement[]>

  request(name: 'Driver.click', options: {context: TContext; element: TElement | TSelector}): Promise<void>

  request(name: 'Driver.getWindowSize', options: {driver: TDriver}): Promise<Size>

  request(name: 'Driver.setWindowSize', options: {driver: TDriver; size: Partial<Size>}): Promise<void>

  request(name: 'Driver.getViewportSize', options: {driver: TDriver}): Promise<Size>

  request(name: 'Driver.setViewportSize', options: {driver: TDriver; size: Size}): Promise<void>

  request(name: 'Driver.getDriverInfo', options: {driver: TDriver}): Promise<DriverInfo>

  request(name: 'Driver.getTitle', options: {driver: TDriver}): Promise<string>

  request(name: 'Driver.getUrl', options: {driver: TDriver}): Promise<string>

  request(name: 'Driver.takeScreenshot', options: {driver: TDriver}): Promise<string>

  request(name: 'Driver.visit', options: {driver: TDriver; url: string}): Promise<void>

  request(name: 'Driver.getOrientation', options: {driver: TDriver}): Promise<'portrait' | 'landscape'>

  request(name: 'Driver.getElementRegion', options: {driver: TDriver; element: TElement}): Promise<Region>

  request(
    name: 'Driver.getElementAttribute',
    options: {driver: TDriver; element: TElement; attr: string},
  ): Promise<string>

  request(name: 'Driver.getElementText', options: {driver: TDriver; element: TElement}): Promise<string>

  request(name: 'Driver.performAction', options: {driver: TDriver; steps: any[]}): Promise<void>

  command(
    name: 'Core.makeManager',
    handler: (config?: EyesManagerConfig) => Promise<Ref<EyesManager<TDriver, TElement, TSelector>>>,
  ): () => void

  command(name: 'Core.getViewportSize', handler: (options: {driver: TDriver}) => Promise<Size>): () => void

  command(name: 'Core.setViewportSize', handler: (options: {driver: TDriver; size: Size}) => Promise<void>): () => void

  command(name: 'Core.closeBatches', handler: (settings: CloseBatchesSettings) => Promise<void>): () => void

  command(name: 'Core.deleteTest', handler: (settings: DeleteTestSettings) => Promise<void>): () => void

  command(
    name: 'EyesManager.openEyes',
    handler: (options: {
      manager: Ref<EyesManager<TDriver, TElement, TSelector>>
      driver: TDriver
      config?: EyesConfig<TElement, TSelector>
      on?: (event: string, data?: Record<string, any>) => any
    }) => Promise<Ref<Eyes<TElement, TSelector>>>,
  ): () => void

  command(
    name: 'EyesManager.closeAllEyes',
    handler: (options: {
      manager: Ref<EyesManager<TDriver, TElement, TSelector>>
      throwErr?: boolean
    }) => Promise<TestResult[]>,
  ): () => void

  command(
    name: 'Eyes.check',
    handler: (options: {
      eyes: Ref<Eyes<TElement, TSelector>>
      settings: CheckSettings<TElement, TSelector>
      config?: EyesConfig<TElement, TSelector>
    }) => Promise<MatchResult>,
  ): () => void

  command<TLocator extends string>(
    name: 'Eyes.locate',
    handler: (options: {
      eyes: Ref<Eyes<TElement, TSelector>>
      settings: LocateSettings<TLocator>
      config?: EyesConfig<TElement, TSelector>
    }) => Promise<Record<TLocator, Region[]>>,
  ): () => void

  command(
    name: 'Eyes.extractText',
    handler: (options: {
      eyes: Ref<Eyes<TElement, TSelector>>
      regions: OCRExtractSettings<TElement, TSelector>[]
      config?: EyesConfig<TElement, TSelector>
    }) => Promise<string[]>,
  ): () => void

  command<TPattern extends string>(
    name: 'Eyes.extractTextRegions',
    handler: (options: {
      eyes: Ref<Eyes<TElement, TSelector>>
      settings: OCRSearchSettings<TPattern>
      config?: EyesConfig<TElement, TSelector>
    }) => Promise<Record<TPattern, TextRegion[]>>,
  ): () => void

  command(
    name: 'Eyes.close',
    handler: (options: {eyes: Ref<Eyes<TElement, TSelector>>; throwErr?: boolean}) => Promise<TestResult[]>,
  ): () => void

  command(
    name: 'Eyes.abort',
    handler: (options: {eyes: Ref<Eyes<TElement, TSelector>>}) => Promise<TestResult[]>,
  ): () => void
}
