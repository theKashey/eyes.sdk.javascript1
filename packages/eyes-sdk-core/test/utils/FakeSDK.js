const {spec} = require('@applitools/driver/fake')
const VisualGridClient = require('@applitools/visual-grid-client')
const {EyesSDK} = require('../../index')

module.exports = EyesSDK({
  name: 'eyes.fake',
  version: '0.2.0',
  spec,
  VisualGridClient,
})
