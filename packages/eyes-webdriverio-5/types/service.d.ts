import type {
  Element,
  Selector,
  Eyes,
  ConfigurationPlain,
  Configuration,
  CheckSettingsPlain,
  CheckSettings,
  TestResults,
  TestResultsSummary,
} from './index'

declare global {
  namespace WebdriverIO {
    interface ServiceOption extends ConfigurationPlain {
      useVisualGrid?: boolean
      concurrency?: number
      eyes?: ServiceOption
    }
    interface Browser {
      getEyes(): Eyes
      eyesCheck(checkSettings?: CheckSettingsPlain): Promise<void>
      eyesCheck(title: string, checkSettings: CheckSettings): Promise<void>
      eyesSetScrollRootElement(element: Element | Selector): void
      eyesAddProperty(key: string, value: string): void
      eyesClearProperties(): void
      eyesGetTestResults(): Promise<TestResults>
      eyesSetConfiguration(configuration: ConfigurationPlain): void
      eyesGetConfiguration(): Configuration
      eyesGetIsOpen(): boolean
      eyesGetAllTestResults(throwErr: boolean): Promise<TestResultsSummary>
    }
  }
}
