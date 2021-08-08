const EyesClassic = require('./EyesClassic')
const EyesVisualGrid = require('./EyesVisualGrid')
const EyesFactory = require('./EyesFactory')

function EyesSDK({name, version, spec, VisualGridClient}) {
  const SDKEyesClassic = EyesClassic.specialize({
    agentId: `${name}/${version}`,
    spec,
  })

  const SDKEyesVisualGrid = EyesVisualGrid.specialize({
    agentId: `${name}.visualgrid/${version}`,
    spec: spec,
    VisualGridClient,
  })

  const SDKEyesFactory = EyesFactory.specialize({
    EyesClassic: SDKEyesClassic,
    EyesVisualGrid: SDKEyesVisualGrid,
  })

  return {
    EyesClassic: SDKEyesClassic,
    EyesVisualGrid: SDKEyesVisualGrid,
    EyesFactory: SDKEyesFactory,
  }
}

module.exports = EyesSDK
