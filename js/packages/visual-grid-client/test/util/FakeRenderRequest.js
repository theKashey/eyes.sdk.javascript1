'use strict'

class FakeRenderRequest {
  constructor(dom, resources) {
    this.dom = dom
    this.resources = resources
  }

  getRenderId() {
    return this.renderId
  }

  setRenderId(renderId) {
    this.renderId = renderId
  }

  getDom() {
    return this.dom
  }

  getResources() {
    return this.resources
  }
}

module.exports = FakeRenderRequest
