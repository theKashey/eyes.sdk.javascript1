import type * as core from '@applitools/core'
import {Region} from './Region'

export type OCRRegion<TElement = unknown, TSelector = unknown> = {
  target: Region | TElement | core.Selector<TSelector>
  hint?: string
  minMatch?: number
  language?: string
}
