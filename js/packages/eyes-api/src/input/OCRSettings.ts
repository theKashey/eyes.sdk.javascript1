export type OCRSettings<TPattern extends string = string> = {
  patterns: TPattern[]
  ignoreCase?: boolean
  firstOnly?: boolean
  language?: string
}
