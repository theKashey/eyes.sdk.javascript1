import * as types from './types'

type NamedParam = {
  name: string
}

type StrictParam = NamedParam & {
  strict?: boolean
}

type NumberParam = StrictParam & {
  lt?: number
  lte?: number
  gt?: number
  gte?: number
}

type StringParam = StrictParam & {
  alpha?: boolean
  numeric?: boolean
}

type CustomParam = StrictParam & {
  message?: string
}

export function notNull(value: any, {name}: NamedParam) {
  if (types.isNull(value)) {
    throw new Error(`IllegalArgument: ${name} is not allowed to be null or undefined`)
  }
}

export function isBoolean(value: any, {name, strict = true}: StrictParam) {
  if ((strict || !types.isNull(value)) && !types.isBoolean(value)) {
    throw new Error(`IllegalType: ${name} must be of type boolean. Received ${value}`)
  }
}

export function isNumber(value: any, {name, strict = true, lt, lte, gt, gte}: NumberParam) {
  if ((strict || !types.isNull(value)) && !types.isNumber(value)) {
    throw new Error(`IllegalArgument: ${name} must be of type number. Received ${value}`)
  }
  if (!types.isNull(lt)) isLessThen(value, lt, {name})
  else if (!types.isNull(lte)) isLessThenOrEqual(value, lte, {name})
  else if (!types.isNull(gt)) isGreaterThen(value, gt, {name})
  else if (!types.isNull(gte)) isGreaterThenOrEqual(value, gte, {name})
}

export function isInteger(value: any, {name, strict = true, lt, lte, gt, gte}: NumberParam) {
  if ((strict || !types.isNull(value)) && !types.isInteger(value)) {
    throw new Error(`IllegalArgument: ${name} must be an integer of type number. Received ${value}`)
  }
  if (!types.isNull(lt)) isLessThen(value, lt, {name})
  else if (!types.isNull(lte)) isLessThenOrEqual(value, lte, {name})
  else if (!types.isNull(gt)) isGreaterThen(value, gt, {name})
  else if (!types.isNull(gte)) isGreaterThenOrEqual(value, gte, {name})
}

export function isLessThen(value: any, limit: number, {name}: NamedParam) {
  if (!(value < limit)) {
    throw new Error(`IllegalArgument: ${name} must be < ${limit}. Received ${value}`)
  }
}

export function isLessThenOrEqual(value: any, limit: number, {name}: NamedParam) {
  if (!(value <= limit)) {
    throw new Error(`IllegalArgument: ${name} must be <= ${limit}. Received ${value}`)
  }
}

export function isGreaterThen(value: any, limit: number, {name}: NamedParam) {
  if (!(value > limit)) {
    throw new Error(`IllegalArgument: ${name} must be > ${limit}. Received ${value}`)
  }
}

export function isGreaterThenOrEqual(value: any, limit: number, {name}: NamedParam) {
  if (!(value >= limit)) {
    throw new Error(`IllegalArgument: ${name} must be >= ${limit}. Received ${value}`)
  }
}

export function isString(value: any, {name, strict = true, alpha, numeric}: StringParam) {
  if ((strict || !types.isNull(value)) && !types.isString(value)) {
    throw new Error(`IllegalArgument: ${name} must be of type string. Received ${value}`)
  }
  if (alpha && numeric) isAlphanumeric(value, {name})
  else if (alpha) isAlpha(value, {name})
  else if (numeric) isNumeric(value, {name})
}

export function isAlphanumeric(value: any, {name}: NamedParam) {
  if (!/^[a-z0-9]+$/i.test(value)) {
    throw new Error(`IllegalArgument: ${name} must be an alphanumeric string. Received ${value}`)
  }
}

export function isAlpha(value: any, {name}: NamedParam) {
  if (!/^[a-z]+$/i.test(value)) {
    throw new Error(`IllegalArgument: ${name} must be an alphabetic string. Received ${value}`)
  }
}

export function isNumeric(value: any, {name}: NamedParam) {
  if (!/^[0-9]+$/.test(value)) {
    throw new Error(`IllegalArgument: ${name} must be a numeric sring. Received ${value}`)
  }
}

export function isArray(value: any, {name, strict = true}: StrictParam) {
  if ((strict || !types.isNull(value)) && !types.isArray(value)) {
    throw new Error(`IllegalArgument: ${name} must be of type array. Received ${value}`)
  }
}

export function isObject(value: any, {name, strict = true}: StrictParam) {
  if ((strict || !types.isNull(value)) && !types.isObject(value)) {
    throw new Error(`IllegalArgument: ${name} must be of type object. Received ${value}`)
  }
}

export function isEnumValue(value: any, enumeration: Record<string, any>, {name, strict = true}: StrictParam) {
  const values = new Set(Object.values(enumeration))
  if ((strict || !types.isNull(value)) && !values.has(value)) {
    const list = Array.from(values, value => JSON.stringify(value)).join(', ')
    throw new Error(`IllegalArgument: ${name} must be one of [${list}]. Received ${value}`)
  }
}

export function isOneOf<TValue>(value: any, values: readonly TValue[], {name, strict = true}: StrictParam) {
  if ((strict || !types.isNull(value)) && !values.includes(value)) {
    const list = values.map(value => JSON.stringify(value)).join(', ')
    throw new Error(`IllegalArgument: ${name} must be one of [${list}]. Received ${value}`)
  }
}

export function instanceOf(value: any, ctor: new (...args: any) => any, {name, strict = true}: StrictParam) {
  if ((strict || !types.isNull(value)) && !types.instanceOf(value, ctor)) {
    throw new Error(`IllegalType: ${name} must be an instance of ${ctor.name}`)
  }
}

export function custom(value: any, check: (value: any) => boolean, {name, strict = true, message}: CustomParam) {
  if ((strict || !types.isNull(value)) && !check(value)) {
    throw new Error(`IllegalType: ${name} ${message || 'is wrong type'}`)
  }
}

export function isGoogleFont(url: string): boolean {
  if (/https:\/\/fonts.googleapis.com/.test(url)) return true
  else return false
}
