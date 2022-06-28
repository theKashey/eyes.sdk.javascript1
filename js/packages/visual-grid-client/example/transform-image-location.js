// shamelessly copied from vg-cli
'use strict'

const {URL} = require('url')

function transformImageLocation(imageLocation, serverUrl) {
  if (!imageLocation.includes('windows.net')) return imageLocation

  const sourceUrl = new URL(imageLocation)

  const transformedUrl = new URL(serverUrl)

  if (sourceUrl.pathname.startsWith('/temp')) {
    transformedUrl.pathname = '/api/sessions/running/data/'
  } else {
    transformedUrl.pathname = '/api/images/se~'
  }
  const randomSourcePart = sourceUrl.pathname.split('/')[2]

  if (!randomSourcePart) throw new Error(`unknown imageLocation format: ${imageLocation}`)

  transformedUrl.pathname += randomSourcePart

  const apiKey = sourceUrl.searchParams.get('accessKey')

  if (!apiKey) throw new Error(`unknown imageLocation format: ${imageLocation}`)

  transformedUrl.searchParams.set('apiKey', apiKey)

  return transformedUrl.href
}

module.exports = transformImageLocation
