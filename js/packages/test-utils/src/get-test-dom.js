const fetch = require('node-fetch')

async function getTestDom(result, domId) {
  const sessionUrl = new URL(result.appUrls.session)
  const accountId = sessionUrl.searchParams.get('accountId')
  const url = `${sessionUrl.origin}/api/images/dom/${domId}/?accountId=${accountId}&apiKey=${process.env.APPLITOOLS_API_KEY_READ}`

  const response = await fetch(url)
  const dom = await response.json()

  return {
    ...dom,
    getNodesByAttribute: attr => getNodesByAttribute(dom, attr),
  }

  function getNodesByAttribute(node, attr) {
    const result = []
    if (node.attributes && node.attributes[attr]) {
      result.push(node)
    }
    if (node.childNodes) {
      node.childNodes.forEach(node => result.push(...getNodesByAttribute(node, attr)))
    }
    return result
  }
}

module.exports = getTestDom
