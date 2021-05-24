import * as Options from './Options'
import * as Configs from './Configs'
import * as Settings from './Settings'
import * as Results from './Results'

export interface Core<TDriver, TElement, TSelector> {
  makeManager(config?: Configs.EyesManagerConfig): EyesManager<TDriver, TElement, TSelector>
  getViewportSize(driver: TDriver): Promise<Options.RectangleSize>
  setViewportSize(driver: TDriver, viewportSize: Options.RectangleSize): Promise<void>
  closeBatch(options: {batchId: string; serverUrl?: string; apiKey?: string; proxy?: Options.Proxy}): Promise<void>
  deleteTest(results: {
    testId: string
    batchId: string
    secretToken: string
    serverUrl?: string
    apiKey?: string
    proxy?: Options.Proxy
  }): Promise<void>
}

export interface EyesManager<TDriver, TElement, TSelector> {
  makeEyes(options: Configs.EyesMakeConfig<TDriver, TElement, TSelector>): Promise<Eyes<TElement, TSelector>>
  closeAllEyes: () => Promise<Results.TestResult[]>
}

export interface Eyes<TElement, TSelector> {
  check(options: {
    settings?: Settings.CheckSettings<TElement, TSelector>
    config?: Configs.EyesConfig<TElement, TSelector>
  }): Promise<Results.MatchResult>
  locate<TLocator extends string>(options: {
    settings: Settings.LocateSettings<TLocator>
    config?: Configs.EyesConfig<TElement, TSelector>
  }): Promise<Record<TLocator, Options.Region[]>>
  extractText(options: {
    regions: Settings.OCRExtractSettings<TElement, TSelector>[]
    config?: Configs.EyesConfig<TElement, TSelector>
  }): Promise<string[]>
  extractTextRegions<TPattern extends string>(options: {
    settings: Settings.OCRSearchSettings<TPattern>
    config?: Configs.EyesConfig<TElement, TSelector>
  }): Promise<Record<TPattern, Options.TextRegion[]>>
  close(): Promise<Results.TestResult>
  abort(): Promise<Results.TestResult>
}
