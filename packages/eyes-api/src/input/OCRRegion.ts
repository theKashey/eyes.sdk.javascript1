import {Region} from './Region'

export type OCRRegion<TElement = unknown, TSelector = unknown> = {
  target: Region | TElement | TSelector
  hint?: string
  minMatch?: number
  language?: string
}
