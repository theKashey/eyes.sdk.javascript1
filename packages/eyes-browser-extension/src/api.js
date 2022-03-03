import {makeMessenger} from './messenger'
import {makeMark} from './marker'

const mark = makeMark()
const messenger = makeMessenger({
  onMessage: fn => window.addEventListener('applitools-message', ({detail}) => fn(detail)),
  sendMessage: detail => window.dispatchEvent(new CustomEvent('applitools-message', {detail: mark(detail)})),
})

messenger.on('Core.setManager', ({manager}) => (window.__applitools.manager = new EyesManager({manager})))
messenger.on('Core.setEyes', ({eyes}) => (window.__applitools.eyes = new Eyes({eyes})))

class Core {
  async makeManager(config) {
    const manager = await messenger.request('Core.makeManager', config)
    return new EyesManager({manager})
  }
  async openEyes(config) {
    const eyes = await messenger.request('Core.openEyes', config)
    return new Eyes({eyes})
  }
  async getViewportSize() {
    return messenger.request('Core.getViewportSize')
  }
  async setViewportSize(options) {
    return messenger.request('Core.setViewportSize', options)
  }
  async closeBatches(options) {
    return messenger.request('Core.closeBatches', options)
  }
  async deleteTest(options) {
    return messenger.request('Core.deleteTest', options)
  }
}

class EyesManager {
  constructor({manager}) {
    this._manager = manager
  }
  async openEyes(options) {
    const eyes = await messenger.request('EyesManager.openEyes', {manager: this._manager, ...options})
    return new Eyes({eyes})
  }
  async closeManager(options) {
    return messenger.request('EyesManager.closeManager', {manager: this._manager, ...options})
  }
}

class Eyes {
  constructor({eyes}) {
    this._eyes = eyes
  }
  async check(options) {
    return messenger.request('Eyes.check', {eyes: this._eyes, ...options})
  }
  async locate(options) {
    return messenger.request('Eyes.locate', {eyes: this._eyes, ...options})
  }
  async extractText(options) {
    return messenger.request('Eyes.extractText', {eyes: this._eyes, ...options})
  }
  async extractTextRegions(options) {
    return messenger.request('Eyes.extractTextRegions', {eyes: this._eyes, ...options})
  }
  async close(options) {
    return messenger.request('Eyes.close', {eyes: this._eyes, ...options})
  }
  async abort() {
    return messenger.request('Eyes.abort', {eyes: this._eyes})
  }
}

window.__applitools = new Core()
