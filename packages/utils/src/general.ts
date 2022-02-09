import * as types from './types'

export function getEnvValue<T extends 'boolean' | 'number' | 'string' = 'string'>(
  name: string,
  type?: T,
): T extends 'boolean' ? boolean : T extends 'number' ? number : string {
  if (!process) return
  const value = process.env[`APPLITOOLS_${name}`]
  if (value === undefined || value === 'null') return
  if (type === 'boolean' && types.isBoolean(value)) return (value === 'true') as any
  if (type === 'number') return Number(value) as any
  return value as any
}

export function guid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0

    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function jwtDecode(token: string): Record<string, any> {
  let payloadSeg = token.split('.')[1]
  payloadSeg += new Array(5 - (payloadSeg.length % 4)).join('=')
  payloadSeg = payloadSeg.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(Buffer.from(payloadSeg, 'base64').toString())
}

export function sleep(ms: number) {
  if (types.isNumber(ms)) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export function toJSON<TObject extends Record<PropertyKey, any>, TKey extends string, TProps extends Readonly<TKey[]>>(
  object: TObject,
  props: TProps,
): {
  [key in TProps[number]]: TObject[key] extends {toJSON(): any} ? ReturnType<TObject[key]['toJSON']> : TObject[key]
}
export function toJSON<
  TObject extends Record<PropertyKey, any>,
  TKey extends string,
  TProps extends Readonly<Record<TKey, PropertyKey>>
>(
  object: TObject,
  props: TProps,
): {
  [key in keyof TProps]: TObject[TProps[key]] extends {toJSON(): any}
    ? ReturnType<TObject[TProps[key]]['toJSON']>
    : TObject[TProps[key]]
}
export function toJSON<TObject extends Record<PropertyKey, any>>(
  object: TObject,
): {
  [key in keyof Omit<TObject, symbol>]: TObject[key] extends {toJSON(): any}
    ? ReturnType<TObject[key]['toJSON']>
    : TObject[key]
}
export function toJSON(object: Record<PropertyKey, any>, props?: string[] | Record<string, PropertyKey>) {
  if (!types.isObject(object)) return null
  const original = props ? Object.values(props) : Object.keys(object)
  const keys = !props || types.isArray(props) ? original : Object.keys(props)
  return keys.reduce((plain: any, key, index) => {
    const value = object[original[index] as string]
    plain[key] = value && types.isFunction(value.toJSON) ? value.toJSON() : value
    return plain
  }, {})
}

export function toString(object: Record<PropertyKey, any>): string {
  return `${this.constructor.name} ${JSON.stringify(object, null, 2)}`
}

export function pluralize(object: [] | number, config?: [manyCase: string, singleCase: string]): string {
  const count = types.isArray(object) ? object.length : object
  const isMany = count > 1
  let res = isMany ? 's' : ''
  if (config) {
    res = isMany ? config[0] : config[1]
  }
  return res
}
