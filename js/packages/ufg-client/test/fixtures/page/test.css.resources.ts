import {readFileSync} from 'fs'
import {makeResource} from '../../../src/resource'

export function makeFixtureResources({baseUrl}: {baseUrl: string}) {
  const cssName = 'test.css'
  const cssUrl = `${baseUrl}/page/${cssName}`
  const cssContent = readFileSync(`./test/fixtures/page/${cssName}`)

  const jpgName1 = 'smurfs1.jpg'
  const jpgUrl1 = `${baseUrl}/page/${jpgName1}`
  const jpgContent1 = readFileSync(`./test/fixtures/page/${jpgName1}`)

  const jpgName2 = 'smurfs2.jpg'
  const jpgUrl2 = `${baseUrl}/page/${jpgName2}`
  const jpgContent2 = readFileSync(`./test/fixtures/page/${jpgName2}`)

  const jpgName3 = 'smurfs3.jpg'
  const jpgUrl3 = `${baseUrl}/page/${jpgName3}`
  const jpgContent3 = readFileSync(`./test/fixtures/page/${jpgName3}`)

  const importedName = 'imported.css'
  const importedUrl = `${baseUrl}/page/${importedName}`
  const importedContent = readFileSync(`./test/fixtures/page/${importedName}`)

  const importedNestedName = 'imported-nested.css'
  const importedNestedUrl = `${baseUrl}/page/${importedNestedName}`
  const importedNestedContent = readFileSync(`./test/fixtures/page/${importedNestedName}`)

  const fontZillaName = 'zilla_slab.woff2'
  const fontZillaUrl = `${baseUrl}/page/${fontZillaName}`
  const fontZillaContent = readFileSync(`./test/fixtures/page/${fontZillaName}`)

  const fontShadowName = 'shadows_into_light.woff2'
  const fontShadowUrl = `${baseUrl}/page/${fontShadowName}`
  const fontShadowContent = readFileSync(`./test/fixtures/page/${fontShadowName}`)

  const err404Url = `${baseUrl}/predefined-status/404`
  const err403Url = `${baseUrl}/predefined-status/403`
  const errHangupUrl = `${baseUrl}/predefined-status/hangup`

  const cssType = 'text/css; charset=UTF-8'
  const fontType = 'font/woff2'
  const jpgType = 'image/jpeg'

  return {
    [cssUrl]: makeResource({contentType: cssType, value: cssContent}).hash,
    [importedUrl]: makeResource({contentType: cssType, value: importedContent}).hash,
    [fontZillaUrl]: makeResource({contentType: fontType, value: fontZillaContent}).hash,
    [err404Url]: makeResource({id: '404', errorStatusCode: 404}).hash,
    [err403Url]: makeResource({id: '403', errorStatusCode: 403}).hash,
    [fontShadowUrl]: makeResource({contentType: fontType, value: fontShadowContent}).hash,
    [jpgUrl3]: makeResource({contentType: jpgType, value: jpgContent3}).hash,
    [jpgUrl1]: makeResource({contentType: jpgType, value: jpgContent1}).hash,
    [importedNestedUrl]: makeResource({contentType: cssType, value: importedNestedContent}).hash,
    [jpgUrl2]: makeResource({contentType: jpgType, value: jpgContent2}).hash,
    [errHangupUrl]: makeResource({id: '504', errorStatusCode: 504}).hash,
  }
}
