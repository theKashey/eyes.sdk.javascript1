import * as utils from '@applitools/utils'

const MARKER = 'applitools-element-mark'

export function makeMark() {
  return function mark(value) {
    if (value instanceof HTMLElement) {
      const elementId = utils.general.guid()
      for (let element = value; element; element = element.getRootNode().host) {
        const oldElementId = element.getAttribute(MARKER)
        const newElementId = oldElementId ? `${oldElementId} ${elementId}` : elementId
        element.setAttribute(MARKER, newElementId)
      }

      const f = {[MARKER]: `[${MARKER}~="${elementId}"]`}

      console.log(f)

      return f
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
      const selector = value[MARKER]
      let root = document
      let element = root.querySelector(selector)
      while (element.shadowRoot) {
        element.removeAttribute(MARKER)
        const nextElement = element.shadowRoot.querySelector(selector)
        if (!nextElement) break
        element = nextElement
      }
      const ref = refer.ref(element)
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
