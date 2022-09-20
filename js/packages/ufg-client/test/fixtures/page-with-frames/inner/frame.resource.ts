import {readFileSync} from 'fs'
import {makeResource} from '../../../../src/resource'
import {makeResourceDom} from '../../../../src/resource-dom'

export function makeFixtureResource({baseUrl}: {baseUrl: string}) {
  const jpgName1 = 'smurfs.jpg'
  const jpgUrl1 = `${baseUrl}/page-with-frames/inner/${jpgName1}`
  const jpgContent1 = readFileSync(`./test/fixtures/page-with-frames/inner/${jpgName1}`)

  const jpgType = 'image/jpeg'

  return makeResourceDom({
    cdt: require('./frame.cdt.json'),
    resources: {
      [jpgUrl1]: makeResource({contentType: jpgType, value: jpgContent1}).hash,
    },
  })
}
