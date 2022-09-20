import * as utils from '@applitools/utils'
import ValueParser from 'postcss-value-parser'

export function extractCssDependencyUrls(css: string): string[] {
  const urls = []
  const parsedValue = new ValueParser(css)
  parsedValue.walk((node, index, nodes) => {
    urls.push(...extractUrls(node, index, nodes))
  })
  return [...new Set(urls)].map(utils.general.toUriEncoding).map(utils.general.toUnAnchoredUri)
}

function extractUrls(node, index, nodes): string[] {
  if (node.type === 'function') {
    if (node.value === 'url' && node.nodes?.length == 1) {
      return [node.nodes[0].value]
    }
    if (node.value.includes('image-set') && node.nodes) {
      return node.nodes.filter(n => n.type === 'string').map(n => n.value)
    }
  } else if (node.type === 'word') {
    if (node.value === '@import' && nodes[index + 2]?.type === 'string') {
      return [nodes[index + 2].value]
    }
  }
  return []
}
