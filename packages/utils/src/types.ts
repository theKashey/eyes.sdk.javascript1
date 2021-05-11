/* eslint {"@typescript-eslint/ban-types": ["error", {"types": {"Function": false}}]} */

export function isNull(value: any): value is null | undefined {
  return value == null
}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean' || value instanceof Boolean
}

export function isString(value: any): value is string {
  return Object.prototype.toString.call(value) === '[object String]'
}

export function isBase64(value: any): value is string {
  return isString(value) && /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(value)
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' || value instanceof Number
}

export function isInteger(value: any): value is number {
  return isNumber(value) && Number.isInteger(value)
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value)
}

export function isObject(value: any): value is Record<PropertyKey, any> {
  return typeof value === 'object' && value !== null
}

export function isEmpty(value: Record<PropertyKey, unknown>): value is Record<PropertyKey, never>
export function isEmpty(value: any[]): value is []
export function isEmpty(value: string): value is ''
export function isEmpty(value: any): boolean {
  if (!value) return true
  if (isObject(value)) return Object.keys(value).length === 0
  return value.length === 0
}

export function isFunction(value: any): value is (...args: any[]) => any
export function isFunction<TKey extends PropertyKey>(
  value: any,
  key: TKey,
): value is {[key in TKey]: (...args: any[]) => any}
export function isFunction<TKey extends PropertyKey>(value: any, key?: TKey): boolean {
  if (key && has(value, key)) return typeof value[key] === 'function'
  return typeof value === 'function'
}

export function isEnumValue<TEnum extends Record<string, string | number>, TValues extends TEnum[keyof TEnum]>(
  value: any,
  enumeration: TEnum,
): value is TValues {
  const values = new Set(Object.values(enumeration))
  return values.has(value)
}

export function has<TKey extends PropertyKey>(
  value: any,
  keys: TKey | readonly TKey[],
): value is Record<TKey, unknown> {
  if (!isObject(value)) return false

  if (!isArray(keys)) keys = [keys as TKey]

  for (const key of keys) {
    if (!(key in value)) return false
  }

  return true
}

export function instanceOf<TCtor>(value: any, ctorName: string): value is TCtor
export function instanceOf<TCtor extends Function>(value: any, ctor: TCtor): value is TCtor['prototype']
export function instanceOf(value: any, ctorOrName: Function | string): boolean {
  if (!isObject(value)) return false
  if (!isString(ctorOrName)) return value instanceof ctorOrName
  let proto = Object.getPrototypeOf(value)
  while (proto) {
    if (proto.constructor.name === ctorOrName) return true
    proto = Object.getPrototypeOf(proto)
  }
  return false
}
