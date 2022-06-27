function amendRegionIdsToCodedRegions({source, destination}) {
  let result = {}
  Object.entries(destination).forEach(entry => {
    const regionType = entry[0]
    const regions = entry[1]
      .map((region, regionIndex) => {
        if (source[regionType][regionIndex].regionId)
          return {...region, regionId: source[regionType][regionIndex].regionId}
        else return region
      })
      .sort((r1, r2) => {
        if (r1.top !== r2.top) return r1.top > r2.top ? 1 : -1
        return r1.left > r2.left ? 1 : -1
      })
    result[regionType] = regions
  })
  return result
}

module.exports = amendRegionIdsToCodedRegions
