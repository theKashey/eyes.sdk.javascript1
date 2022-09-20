import type {SpecDriver} from '@applitools/types'
import type {Core as BaseCore} from '@applitools/types/base'
import type {Core} from '@applitools/types/classic'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeCore as makeBaseCore} from '@applitools/core-base'
import {makeGetViewportSize} from '../automation/get-viewport-size'
import {makeSetViewportSize} from '../automation/set-viewport-size'
import {makeLocate} from '../automation/locate'
import {makeOpenEyes} from './open-eyes'
import * as utils from '@applitools/utils'

type Options<TDriver, TContext, TElement, TSelector> = {
  spec: SpecDriver<TDriver, TContext, TElement, TSelector>
  core?: BaseCore
  agentId?: string
  cwd?: string
  logger?: Logger
}

export function makeCore<TDriver, TContext, TElement, TSelector>({
  spec,
  core,
  agentId = 'core-classic',
  cwd = process.cwd(),
  logger,
}: Options<TDriver, TContext, TElement, TSelector>): Core<TDriver, TElement, TSelector> {
  logger = logger?.extend({label: 'core-classic'}) ?? makeLogger({label: 'core-classic'})
  logger.log(`Core classic is initialized ${core ? 'with' : 'without'} custom base core`)

  core ??= makeBaseCore({agentId, cwd, logger})

  return utils.general.extend(core, {
    type: 'classic' as const,
    isDriver: spec?.isDriver,
    isElement: spec?.isElement,
    isSelector: spec?.isSelector,
    getViewportSize: spec && makeGetViewportSize({spec, logger}),
    setViewportSize: spec && makeSetViewportSize({spec, logger}),
    locate: makeLocate({spec, core, logger}),
    openEyes: makeOpenEyes({spec, core, logger}),
  })
}
