import {readFileSync} from 'fs'
import {makeResource} from '../../../src/resource'

export function makeFixtureResources({baseUrl}) {
  const svgName = 'with-style.svg'
  const svgUrl = `${baseUrl}/page/${svgName}`
  const svgContent = readFileSync(`./test/fixtures/page/${svgName}`)

  const jpgName1 = 'gargamel.jpg'
  const jpgUrl1 = `${baseUrl}/page/${jpgName1}`
  const jpgContent1 = readFileSync(`./test/fixtures/page/${jpgName1}`)

  const jpgName2 = 'gargamel1.jpg'
  const jpgUrl2 = `${baseUrl}/page/${jpgName2}`
  const jpgContent2 = readFileSync(`./test/fixtures/page/${jpgName2}`)

  const jpgName3 = 'smurfs3.jpg'
  const jpgUrl3 = `${baseUrl}/page/${jpgName3}`
  const jpgContent3 = readFileSync(`./test/fixtures/page/${jpgName3}`)

  const jpgName4 = 'smurfs4.jpg'
  const jpgUrl4 = `${baseUrl}/page/${jpgName4}`
  const jpgContent4 = readFileSync(`./test/fixtures/page/${jpgName4}`)

  const jpgName5 = 'smurfs5.jpg'
  const jpgUrl5 = `${baseUrl}/page/${jpgName5}`
  const jpgContent5 = readFileSync(`./test/fixtures/page/${jpgName5}`)

  const cssName = 'svg2.css'
  const cssUrl = `${baseUrl}/page/${cssName}`
  const cssContent = readFileSync(`./test/fixtures/page/${cssName}`)

  const svgType = 'image/svg+xml'
  const jpegType = 'image/jpeg'
  const cssType = 'text/css; charset=UTF-8'

  return {
    [svgUrl]: makeResource({contentType: svgType, value: svgContent}).hash,
    [jpgUrl1]: makeResource({contentType: jpegType, value: jpgContent1}).hash,
    [jpgUrl2]: makeResource({contentType: jpegType, value: jpgContent2}).hash,
    [jpgUrl3]: makeResource({contentType: jpegType, value: jpgContent3}).hash,
    [jpgUrl4]: makeResource({contentType: jpegType, value: jpgContent4}).hash,
    [jpgUrl5]: makeResource({contentType: jpegType, value: jpgContent5}).hash,
    [cssUrl]: makeResource({contentType: cssType, value: cssContent}).hash,
  }
}
