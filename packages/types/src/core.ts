import {Size, Region, TextRegion, MatchResult, TestResult} from './data'
import {EyesManagerConfig, EyesConfig} from './config'
import {
  CheckSettings,
  LocateSettings,
  OCRExtractSettings,
  OCRSearchSettings,
  DeleteTestSettings,
  CloseBatchesSettings,
} from './setting'

export interface Core<TDriver, TElement, TSelector> {
  isDriver(driver: any): driver is TDriver
  isElement(element: any): element is TElement
  isSelector(selector: any): selector is TSelector
  makeManager(config?: EyesManagerConfig): Promise<EyesManager<TDriver, TElement, TSelector>>
  getViewportSize(options: {driver: TDriver}): Promise<Size>
  setViewportSize(options: {driver: TDriver; size: Size}): Promise<void>
  closeBatches(options: CloseBatchesSettings): Promise<void>
  deleteTest(results: DeleteTestSettings): Promise<void>
}

export interface EyesManager<TDriver, TElement, TSelector> {
  openEyes(options: {
    driver: TDriver
    config?: EyesConfig<TElement, TSelector>
    on?: (event: string, data?: Record<string, any>) => void
  }): Promise<Eyes<TElement, TSelector>>
  closeAllEyes: () => Promise<TestResult[]>
}

export interface Eyes<TElement, TSelector> {
  check(options: {
    settings?: CheckSettings<TElement, TSelector>
    config?: EyesConfig<TElement, TSelector>
  }): Promise<MatchResult>
  locate<TLocator extends string>(options: {
    settings: LocateSettings<TLocator>
    config?: EyesConfig<TElement, TSelector>
  }): Promise<Record<TLocator, Region[]>>
  extractText(options: {
    regions: OCRExtractSettings<TElement, TSelector>[]
    config?: EyesConfig<TElement, TSelector>
  }): Promise<string[]>
  extractTextRegions<TPattern extends string>(options: {
    settings: OCRSearchSettings<TPattern>
    config?: EyesConfig<TElement, TSelector>
  }): Promise<Record<TPattern, TextRegion[]>>
  close(): Promise<TestResult>
  abort(): Promise<TestResult>
}
