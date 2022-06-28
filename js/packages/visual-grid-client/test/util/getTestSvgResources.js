const {loadFixtureBuffer} = require('./loadFixture')
const createResource = require('../../src/sdk/resources/createResource')

function getTestSvgResources(baseUrl) {
  const jpgName1 = 'gargamel.jpg'
  const jpgUrl1 = `${baseUrl}/${jpgName1}`
  const jpgContent1 = loadFixtureBuffer(jpgName1)

  const jpgName2 = 'gargamel1.jpg'
  const jpgUrl2 = `${baseUrl}/${jpgName2}`
  const jpgContent2 = loadFixtureBuffer(jpgName2)

  const jpgName3 = 'smurfs3.jpg'
  const jpgUrl3 = `${baseUrl}/${jpgName3}`
  const jpgContent3 = loadFixtureBuffer(jpgName3)

  const jpgName4 = 'smurfs4.jpg'
  const jpgUrl4 = `${baseUrl}/${jpgName4}`
  const jpgContent4 = loadFixtureBuffer(jpgName4)

  const jpgName5 = 'smurfs5.jpg'
  const jpgUrl5 = `${baseUrl}/${jpgName5}`
  const jpgContent5 = loadFixtureBuffer(jpgName5)

  const cssName = 'svg2.css'
  const cssUrl = `${baseUrl}/${cssName}`
  const cssContent = loadFixtureBuffer(cssName)

  const svgType = 'image/jpeg'
  const cssType = 'text/css; charset=UTF-8'

  return {
    [jpgUrl1]: createResource({type: svgType, value: jpgContent1}).hash,
    [jpgUrl2]: createResource({type: svgType, value: jpgContent2}).hash,
    [jpgUrl3]: createResource({type: svgType, value: jpgContent3}).hash,
    [jpgUrl4]: createResource({type: svgType, value: jpgContent4}).hash,
    [jpgUrl5]: createResource({type: svgType, value: jpgContent5}).hash,
    [cssUrl]: createResource({type: cssType, value: cssContent}).hash,
  }
}

module.exports = getTestSvgResources
