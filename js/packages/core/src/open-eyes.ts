import type {Eyes, Config, OpenSettings, SpecDriver} from '@applitools/types'
import type {Core as ClassicCore} from '@applitools/types/classic'
import type {Core as UFGCore} from '@applitools/types/ufg'
import type {Core as BaseCore} from '@applitools/types/base'
import {type Logger} from '@applitools/logger'
import {makeCore as makeClassicCore} from './classic/core'
import {makeCore as makeUFGCore} from './ufg/core'
import {makeCheck} from './check'
import {makeCheckAndClose} from './check-and-close'
import {makeLocateText} from './locate-text'
import {makeExtractText} from './extract-text'
import {makeClose} from './close'
import * as utils from '@applitools/utils'

type Options<TDriver, TContext, TElement, TSelector> = {
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  core?: BaseCore | ClassicCore<TDriver, TElement, TSelector> | UFGCore<TDriver, TElement, TSelector>
  concurrency?: number
  logger?: Logger
}

export function makeOpenEyes<TDriver, TContext, TElement, TSelector>({
  spec,
  core,
  concurrency,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function openEyes<TType extends 'classic' | 'ufg' = 'classic'>({
    type,
    target,
    settings,
    config,
    logger = defaultLogger,
  }: {
    type?: TType
    target?: TDriver
    settings?: Partial<OpenSettings<TType>>
    config?: Config<TElement, TSelector, TType>
    logger?: Logger
  }): Promise<Eyes<TDriver, TElement, TSelector, TType>> {
    settings = {...config?.open, ...settings}
    settings.userTestId ??= `${settings.testName}--${utils.general.guid()}`
    settings.serverUrl ??= utils.general.getEnvValue('SERVER_URL') ?? 'https://eyesapi.applitools.com'
    settings.apiKey ??= utils.general.getEnvValue('API_KEY')
    settings.batch ??= {}
    settings.batch.id ??= utils.general.getEnvValue('BATCH_ID') ?? utils.general.guid()
    settings.batch.name ??= utils.general.getEnvValue('BATCH_NAME')
    settings.batch.sequenceName ??= utils.general.getEnvValue('BATCH_SEQUENCE')
    settings.batch.notifyOnCompletion ??= utils.general.getEnvValue('BATCH_NOTIFY', 'boolean')
    settings.keepBatchOpen ??= utils.general.getEnvValue('DONT_CLOSE_BATCHES', 'boolean')
    settings.branchName ??= utils.general.getEnvValue('BRANCH')
    settings.parentBranchName ??= utils.general.getEnvValue('PARENT_BRANCH')
    settings.baselineBranchName ??= utils.general.getEnvValue('BASELINE_BRANCH')
    settings.ignoreBaseline ??= false
    settings.compareWithParentBranch ??= false
    ;(settings as OpenSettings<'ufg'>).renderConcurrency ??= (config as Config<any, any, 'ufg'>)?.check?.renderers?.length

    if (!utils.types.has(core, 'type')) {
      core = type === 'ufg' ? makeUFGCore({spec, core, concurrency, logger}) : makeClassicCore({spec, core, logger})
    }

    core.logEvent({
      settings: {
        serverUrl: settings.serverUrl,
        apiKey: settings.apiKey,
        proxy: settings.proxy,
        agentId: settings.agentId,
        level: 'Notice',
        event: {
          type: 'runnerStarted',
          testConcurrency: concurrency,
          concurrentRendersPerTest: (settings as OpenSettings<'ufg'>).renderConcurrency,
          node: {version: process.version, platform: process.platform, arch: process.arch},
        },
      },
      logger,
    })

    const eyes = await core.openEyes({target, settings: settings as OpenSettings<TType>, logger})
    return utils.general.extend(eyes as Eyes<TDriver, TElement, TSelector, TType>, {
      check: makeCheck<TDriver, TElement, TSelector, TType>({eyes, logger}),
      checkAndClose: makeCheckAndClose<TDriver, TElement, TSelector, TType>({eyes, logger}),
      locateText: makeLocateText<TDriver, TElement, TSelector, TType>({eyes, logger}),
      extractText: makeExtractText<TDriver, TElement, TSelector, TType>({eyes, logger}),
      close: makeClose<TDriver, TElement, TSelector, TType>({eyes, logger}),
    })
  }
}
