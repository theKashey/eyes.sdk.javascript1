import * as utils from '@applitools/utils'

const MARKER = 'applitools-element-mark'

export function makeMark() {
  return function mark(value) {
    if (value instanceof HTMLElement) {
      const id = utils.general.guid()
      value.setAttribute(MARKER, id)
      return {[MARKER]: `[${MARKER}="${id}"]`}
    } else if (utils.types.isArray(value)) {
      return value.map(mark)
    } else if (utils.types.isObject(value)) {
      return Object.entries(value).reduce((obj, [key, value]) => Object.assign(obj, {[key]: mark(value)}), {})
    } else {
      return value
    }
  }
}

export function makeUnmark({refer}) {
  return function unmark(value) {
    if (utils.types.has(value, MARKER)) {
      const element = document.querySelector(value[MARKER])
      element.removeAttribute(MARKER)
      const ref = refer.ref(element)
      console.log(ref, element)
      return ref
    } else if (utils.types.isArray(value)) {
      return value.map(unmark)
    } else if (utils.types.isObject(value)) {
      return Object.entries(value).reduce((obj, [key, value]) => Object.assign(obj, {[key]: unmark(value)}), {})
    } else {
      return value
    }
  }
}
