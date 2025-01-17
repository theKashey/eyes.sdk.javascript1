import {EyesSelector} from './EyesSelector'
import {Region} from './Region'

export type OCRRegion<TElement = unknown, TSelector = unknown> = {
  target: Region | TElement | EyesSelector<TSelector>
  hint?: string
  minMatch?: number
  language?: string
}
