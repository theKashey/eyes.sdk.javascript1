const fetch = require('node-fetch')

async function getTestInfo(result, apiKey = process.env.APPLITOOLS_API_KEY) {
  const url = `${result.apiUrls.session}?format=json&AccessToken=${result.secretToken}&apiKey=${apiKey}`

  const response = await fetch(url)
  return response.json()
}

module.exports = getTestInfo
