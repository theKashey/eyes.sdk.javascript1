import {Core} from '@applitools/core'
import {SpecDriver} from '@applitools/driver'
export {makeServer as makeExecutionGridClient} from '@applitools/execution-grid-client'

export function makeSDK<TDriver, TContext, TElement, TSelector>(options: {
  name: string
  version: string
  cwd?: string
  spec: SpecDriver<TDriver, TContext, TElement, TSelector>
}): Core<TDriver, TElement, TSelector>

export {Core} from '@applitools/core'

export function checkSpecDriver<TDriver, TContext, TElement, TSelector>(options: {
  spec: SpecDriver<TDriver, TContext, TElement, TSelector>,
  driver: TDriver
}): Promise<any>
