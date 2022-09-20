function makeCloseBatches({core}) {
  return async function closeBatches({settings, logger}) {
    if (!settings.batchIds) return
    return core.closeBatch({settings: settings.batchIds.map(batchId => ({...settings, batchId})), logger})
  }
}

module.exports = makeCloseBatches
