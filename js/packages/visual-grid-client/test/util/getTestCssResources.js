const {loadFixtureBuffer} = require('./loadFixture')
const createResource = require('../../src/sdk/resources/createResource')

function getTestCssResources(baseUrl) {
  const cssName = 'test.css'
  const cssUrl = `${baseUrl}/${cssName}`
  const cssContent = loadFixtureBuffer(cssName)

  const jpgName1 = 'smurfs1.jpg'
  const jpgUrl1 = `${baseUrl}/${jpgName1}`
  const jpgContent1 = loadFixtureBuffer(jpgName1)

  const jpgName2 = 'smurfs2.jpg'
  const jpgUrl2 = `${baseUrl}/${jpgName2}`
  const jpgContent2 = loadFixtureBuffer(jpgName2)

  const jpgName3 = 'smurfs3.jpg'
  const jpgUrl3 = `${baseUrl}/${jpgName3}`
  const jpgContent3 = loadFixtureBuffer(jpgName3)

  const importedName = 'imported.css'
  const importedUrl = `${baseUrl}/${importedName}`
  const importedContent = loadFixtureBuffer(importedName)

  const importedNestedName = 'imported-nested.css'
  const importedNestedUrl = `${baseUrl}/${importedNestedName}`
  const importedNestedContent = loadFixtureBuffer(importedNestedName)

  const fontZillaName = 'zilla_slab.woff2'
  const fontZillaUrl = `${baseUrl}/${fontZillaName}`
  const fontZillaContent = loadFixtureBuffer(fontZillaName)

  const fontShadowName = 'shadows_into_light.woff2'
  const fontShadowUrl = `${baseUrl}/${fontShadowName}`
  const fontShadowContent = loadFixtureBuffer(fontShadowName)

  const err404Url = `${baseUrl}/predefined-status/404`
  const err403Url = `${baseUrl}/predefined-status/403`
  const errHangupUrl = `${baseUrl}/predefined-status/hangup`

  const cssType = 'text/css; charset=UTF-8'
  const fontType = 'font/woff2'
  const jpgType = 'image/jpeg'

  return {
    [cssUrl]: createResource({type: cssType, value: cssContent}).hash,
    [importedUrl]: createResource({type: cssType, value: importedContent}).hash,
    [fontZillaUrl]: createResource({type: fontType, value: fontZillaContent}).hash,
    [importedNestedUrl]: createResource({type: cssType, value: importedNestedContent}).hash,
    [fontShadowUrl]: createResource({type: fontType, value: fontShadowContent}).hash,
    [jpgUrl3]: createResource({type: jpgType, value: jpgContent3}).hash,
    [jpgUrl1]: createResource({type: jpgType, value: jpgContent1}).hash,
    [jpgUrl2]: createResource({type: jpgType, value: jpgContent2}).hash,
    [err404Url]: createResource({errorStatusCode: 404}).hash,
    [err403Url]: createResource({errorStatusCode: 403}).hash,
    [errHangupUrl]: createResource({errorStatusCode: 504}).hash,
  }
}

module.exports = getTestCssResources
