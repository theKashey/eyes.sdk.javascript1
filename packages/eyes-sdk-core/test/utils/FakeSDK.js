const spec = require('./FakeSpecDriver')
const {EyesSDK} = require('../../index')
const VisualGridClient = require('@applitools/visual-grid-client')

module.exports = EyesSDK({
  name: 'eyes.fake',
  version: '0.2.0',
  spec,
  VisualGridClient,
})
