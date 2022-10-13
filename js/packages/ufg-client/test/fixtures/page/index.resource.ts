import {makeResourceDom} from '../../../src/resources/resource-dom'
import {makeFixtureResources as makeFixtureCssResources} from './test.css.resources'

export function makeFixtureResource({baseUrl}: {baseUrl: string}) {
  return makeResourceDom({
    cdt: require('./index.cdt.json'),
    resources: makeFixtureCssResources({baseUrl}),
  })
}
