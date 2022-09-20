import {JSDOM} from '@applitools/jsdom'
import {extractCssDependencyUrls} from './extract-css-dependency-urls'
import * as utils from '@applitools/utils'

export function extractSvgDependencyUrls(svg) {
  const doc = parseDom(svg)

  const srcsetUrls = Array.from(doc.querySelectorAll('img[srcset]')).flatMap(element => {
    return element
      .getAttribute('srcset')
      .split(', ')
      .map(str => str.trim().split(/\s+/, 1)[0])
  })
  const srcUrls = Array.from(doc.querySelectorAll('img[src]')).map(element => {
    return element.getAttribute('src')
  })
  const fromHref = Array.from(doc.querySelectorAll('image,use,link[rel="stylesheet"]')).map(element => {
    return element.getAttribute('href') || element.getAttribute('xlink:href')
  })
  const fromObjects = Array.from(doc.getElementsByTagName('object')).map(element => {
    return element.getAttribute('data')
  })
  const fromStyleTags = Array.from(doc.querySelectorAll('style')).flatMap(element => {
    return element.textContent ? extractCssDependencyUrls(element.textContent) : []
  })

  const fromStyleAttrs = Array.from(doc.querySelectorAll<SVGElement>('*[style]')).flatMap(element => {
    return [...element.style?.cssText?.matchAll(/url\((?!['"]?:)['"]?([^'")]*)['"]?\)/g)].map(match => match[1]).filter(Boolean)
  })

  return [...srcsetUrls, ...srcUrls, ...fromHref, ...fromObjects, ...fromStyleTags, ...fromStyleAttrs]
    .filter(url => !url.startsWith('#'))
    .map(utils.general.toUnAnchoredUri)
}

function parseDom(svg: string): Document {
  if (typeof DOMParser !== 'function') {
    return new JSDOM(svg).window.document
  } else {
    return new DOMParser().parseFromString(svg, 'image/svg+xml')
  }
}
