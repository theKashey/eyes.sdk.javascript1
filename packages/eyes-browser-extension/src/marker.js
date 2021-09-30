import * as utils from '@applitools/utils'

const MARKER = 'applitools-element-mark'

export function makeMark() {
  return function mark(value) {
    if (value instanceof HTMLElement) {
      const elementId = utils.general.guid()
      const path = [value]
      for (let root = value.getRootNode(); root !== document; root = root.host.getRootNode()) {
        path.push(root.host)
      }

      return {
        [MARKER]: path.map(element => {
          const oldElementId = element.getAttribute(MARKER)
          const newElementId = oldElementId ? `${oldElementId} ${elementId}` : elementId
          element.setAttribute(MARKER, newElementId)
          return `[${MARKER}~="${elementId}"]`
        }),
      }
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
      let root = document
      let element
      for (const selector of value[MARKER]) {
        element = root.querySelector(selector)
        element.removeAttribute(MARKER)
        root = element.shadowRoot
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
