import type {Region} from '@applitools/utils'
import type {Target, TestInfo, CheckSettings, CheckResult} from './types'
import type {Eyes as BaseEyes} from '@applitools/core-base'
import {type DomSnapshot, type AndroidSnapshot, type IOSSnapshot} from '@applitools/ufg-client'
import {type AbortSignal} from 'abort-controller'
import {type Logger} from '@applitools/logger'
import {type UFGClient, type RenderSettings} from '@applitools/ufg-client'
import {makeDriver, type SpecDriver, type Selector} from '@applitools/driver'
import {takeSnapshots} from './utils/take-snapshots'
import {waitForLazyLoad} from '../utils/wait-for-lazy-load'
import {toBaseCheckSettings} from '../utils/to-base-check-settings'
import {generateSafeSelectors} from './utils/generate-safe-selectors'
import {AbortError} from '../errors/abort-error'
import * as utils from '@applitools/utils'
import chalk from 'chalk'

type Options<TDriver, TContext, TElement, TSelector> = {
  getEyes: (options: {rawEnvironment: any}) => Promise<BaseEyes>
  client: UFGClient
  test: TestInfo
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  signal?: AbortSignal
  target?: Target<TDriver>
  logger?: Logger
}

export function makeCheck<TDriver, TContext, TElement, TSelector>({
  spec,
  getEyes,
  client,
  test,
  signal,
  target: defaultTarget,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function check({
    target = defaultTarget,
    settings = {},
    logger = defaultLogger,
  }: {
    target?: Target<TDriver>
    settings?: CheckSettings<TElement, TSelector>
    logger?: Logger
  }): Promise<(CheckResult & {promise: Promise<CheckResult & {eyes: BaseEyes}>})[]> {
    logger.log('Command "check" is called with settings', settings)

    if (signal.aborted) {
      logger.warn('Command "check" was called after test was already aborted')
      throw new AbortError('Command "check" was called after test was already aborted')
    }

    const {elementReferencesToCalculate, elementReferenceToTarget, getBaseCheckSettings} = toBaseCheckSettings({settings})

    let snapshots: DomSnapshot[] | AndroidSnapshot[] | IOSSnapshot[],
      snapshotUrl: string,
      snapshotTitle: string,
      userAgent: string,
      regionToTarget: Selector | Region,
      selectorsToCalculate: {originalSelector: Selector; safeSelector: Selector}[]
    if (spec?.isDriver(target)) {
      // TODO driver custom config
      const driver = await makeDriver({spec, driver: target, logger})
      if (driver.isWeb && (!settings.renderers || settings.renderers.length === 0)) {
        const viewportSize = await driver.getViewportSize()
        settings.renderers = [{name: 'chrome', ...viewportSize}]
      }

      let cleanupGeneratedSelectors
      if (driver.isWeb) {
        userAgent = driver.userAgent
        const generated = await generateSafeSelectors({
          context: driver.currentContext,
          elementReferences: [...(elementReferenceToTarget ? [elementReferenceToTarget] : []), ...elementReferencesToCalculate],
        })
        cleanupGeneratedSelectors = generated.cleanupGeneratedSelectors
        if (elementReferenceToTarget) {
          regionToTarget = generated.selectors[0]?.safeSelector
          if (!regionToTarget) throw new Error('Target element not found')
          selectorsToCalculate = generated.selectors.slice(1)
        } else {
          selectorsToCalculate = generated.selectors
        }
      }

      const currentContext = driver.currentContext
      snapshots = await takeSnapshots({
        driver,
        settings: {
          ...test.server,
          waitBeforeCapture: settings.waitBeforeCapture,
          disableBrowserFetching: settings.disableBrowserFetching,
          layoutBreakpoints: settings.layoutBreakpoints,
          renderers: settings.renderers,
          skipResources: client.getCachedResourceUrls(),
        },
        hooks: {
          async beforeSnapshots() {
            if (driver.isWeb && settings.lazyLoad) {
              await waitForLazyLoad({driver, settings: settings.lazyLoad !== true ? settings.lazyLoad : {}, logger})
            }
          },
        },
        provides: {
          getChromeEmulationDevices: client.getChromeEmulationDevices,
          getIOSDevices: client.getIOSDevices,
        },
        logger,
      })
      await currentContext.focus()
      snapshotUrl = await driver.getUrl()
      snapshotTitle = await driver.getTitle()

      await cleanupGeneratedSelectors?.()
    } else {
      snapshots = !utils.types.isArray(target) ? Array(settings.renderers.length).fill(target) : target
      snapshotUrl = utils.types.has(snapshots[0], 'url') ? snapshots[0].url : undefined
    }
    regionToTarget ??= (elementReferenceToTarget as Selector) ?? (settings.region as Region)
    selectorsToCalculate ??= elementReferencesToCalculate.map(selector => ({
      originalSelector: selector as Selector,
      safeSelector: selector as Selector,
    }))

    const promises = settings.renderers.map(async (renderer, index) => {
      if (utils.types.has(renderer, 'name') && renderer.name === 'edge') {
        const message = chalk.yellow(
          `The 'edge' option that is being used in your browsers' configuration will soon be deprecated. Please change it to either 'edgelegacy' for the legacy version or to 'edgechromium' for the new Chromium-based version. Please note, when using the built-in BrowserType enum, then the values are BrowserType.EDGE_LEGACY and BrowserType.EDGE_CHROMIUM, respectively.`,
        )
        logger.console.log(message)
      }

      try {
        if (signal.aborted) {
          logger.warn('Command "check" was aborted before rendering')
          throw new AbortError('Command "check" was aborted before rendering')
        }

        const {cookies, ...snapshot} = snapshots[index] as typeof snapshots[number] & {cookies: any[]}
        const renderTargetPromise = client.createRenderTarget({
          snapshot,
          settings: {renderer, referer: snapshotUrl, cookies, proxy: test.server.proxy, autProxy: settings.autProxy, userAgent},
        })

        const renderSettings: RenderSettings = {
          ...settings,
          region: regionToTarget,
          type: utils.types.has(snapshot, 'cdt') ? 'web' : 'native',
          renderer,
          selectorsToCalculate: selectorsToCalculate.flatMap(({safeSelector}) => safeSelector ?? []),
          includeFullPageSize: Boolean(settings.pageId),
        }

        const {rendererId, rawEnvironment} = await client.bookRenderer({settings: renderSettings})
        const eyes = await getEyes({rawEnvironment})

        try {
          if (signal.aborted) {
            logger.warn('Command "check" was aborted before rendering')
            throw new AbortError('Command "check" was aborted before rendering')
          } else if (eyes.aborted) {
            logger.warn(`Renderer with id ${rendererId} was aborted during one of the previous steps`)
            throw new AbortError(`Renderer with id "${rendererId}" was aborted during one of the previous steps`)
          }

          renderSettings.rendererId = rendererId
          const renderTarget = await renderTargetPromise

          if (signal.aborted) {
            logger.warn('Command "check" was aborted before rendering')
            throw new AbortError('Command "check" was aborted before rendering')
          } else if (eyes.aborted) {
            logger.warn(`Renderer with id ${rendererId} was aborted during one of the previous steps`)
            throw new AbortError(`Renderer with id "${rendererId}" was aborted during one of the previous steps`)
          }

          const {renderId, selectorRegions, ...baseTarget} = await client.render({
            target: renderTarget,
            settings: renderSettings,
            signal,
          })
          let offset = 0
          const baseSettings = getBaseCheckSettings({
            calculatedRegions: selectorsToCalculate.map(({originalSelector, safeSelector}) => ({
              selector: originalSelector,
              regions: safeSelector ? selectorRegions[offset++] : [],
            })),
          })
          baseSettings.renderId = renderId
          baseTarget.source = snapshotUrl
          baseTarget.name = snapshotTitle

          if (signal.aborted) {
            logger.warn('Command "check" was aborted after rendering')
            throw new AbortError('Command "check" was aborted after rendering')
          } else if (eyes.aborted) {
            logger.warn(`Renderer with id ${rendererId} was aborted during one of the previous steps`)
            throw new AbortError(`Renderer with id "${rendererId}" was aborted during one of the previous steps`)
          }

          const [result] = await eyes.check({target: {...baseTarget, isTransformed: true}, settings: baseSettings, logger})

          if (eyes.aborted) {
            logger.warn(`Renderer with id ${rendererId} was aborted during one of the previous steps`)
            throw new AbortError(`Renderer with id "${rendererId}" was aborted during one of the previous steps`)
          }

          return {...result, eyes, renderer}
        } catch (error) {
          await eyes.abort()
          error.info = {eyes}
          throw error
        }
      } catch (error) {
        error.info = {...error.info, userTestId: test.userTestId, renderer}
        throw error
      }
    })

    return settings.renderers.map((renderer, index) => ({
      asExpected: true,
      userTestId: test.userTestId,
      renderer,
      promise: promises[index],
    }))
  }
}
