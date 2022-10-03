import type {SpecDriver} from '@applitools/types'
import type {Core as BaseCore} from '@applitools/types/base'
import type {Core} from '@applitools/types'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeCore as makeBaseCore} from '@applitools/core-base'
import {makeGetViewportSize} from './automation/get-viewport-size'
import {makeSetViewportSize} from './automation/set-viewport-size'
import {makeLocate} from './locate'
import {makeOpenEyes} from './open-eyes'
import {makeMakeManager} from './make-manager'
import {makeCloseBatch} from './close-batch'
import {makeDeleteTest} from './delete-test'
import * as utils from '@applitools/utils'

type Options<TDriver, TContext, TElement, TSelector> = {
  spec: SpecDriver<TDriver, TContext, TElement, TSelector>
  concurrency?: number
  core?: BaseCore
  agentId?: string
  cwd?: string
  logger?: Logger
}

export function makeCore<TDriver, TContext, TElement, TSelector>({
  spec,
  concurrency,
  core,
  agentId = 'core',
  cwd = process.cwd(),
  logger,
}: Options<TDriver, TContext, TElement, TSelector>): Core<TDriver, TElement, TSelector> {
  logger = logger?.extend({label: 'core'}) ?? makeLogger({label: 'core'})
  logger.log(`Core is initialized ${core ? 'with' : 'without'} custom base core`)
  core ??= makeBaseCore({agentId, cwd, logger})

  return utils.general.extend(core, {
    isDriver: spec.isDriver,
    isElement: spec.isElement,
    isSelector: spec.isSelector,
    getViewportSize: makeGetViewportSize({spec, logger}),
    setViewportSize: makeSetViewportSize({spec, logger}),
    locate: makeLocate({spec, core, logger}),
    openEyes: makeOpenEyes({spec, core, concurrency, logger}),
    makeManager: makeMakeManager({spec, concurrency, agentId, logger}),
    closeBatch: makeCloseBatch({core, logger}),
    deleteTest: makeDeleteTest({core, logger}),
  })
}
