import * as utils from '@applitools/utils'

export type PropertyData = {
  name: string
  value: string
}

export class PropertyDataData implements Required<PropertyData> {
  private _property: PropertyData

  constructor(property: PropertyData)
  constructor(name: string, value: string)
  constructor(propertyOrName: PropertyData | string, value?: string) {
    if (utils.types.isString(propertyOrName)) {
      utils.guard.isString(propertyOrName, {name: 'name'})
      utils.guard.notNull(value, {name: 'value'})
      this._property = {name: propertyOrName, value}
    } else {
      utils.guard.isString(propertyOrName.name, {name: 'property.name'})
      utils.guard.notNull(propertyOrName.value, {name: 'property.value'})
      this._property = propertyOrName
    }
  }

  get name(): string {
    return this._property.name
  }
  set name(name: string) {
    this._property.name = name
  }
  getName(): string {
    return this.name
  }
  setName(name: string) {
    this.name = name
  }

  get value(): string {
    return this._property.value
  }
  set value(value: string) {
    this._property.value = value
  }
  getValue(): string {
    return this.value
  }
  setValue(value: string) {
    this.value = value
  }

  /** @internal */
  toObject(): PropertyData {
    return this._property
  }

  /** @internal */
  toJSON(): PropertyData {
    return utils.general.toJSON(this._property)
  }

  /** @internal */
  toString() {
    return utils.general.toString(this)
  }
}
