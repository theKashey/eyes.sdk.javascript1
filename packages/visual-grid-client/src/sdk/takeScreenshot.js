'use strict'

const makeRenderer = require('./renderer')
const createRenderRequest = require('./createRenderRequest')
const {RenderingInfo, deserializeDomSnapshotResult} = require('@applitools/eyes-sdk-core/shared')

require('@applitools/isomorphic-fetch') // TODO can just use node-fetch

async function takeScreenshot({
  showLogs,
  apiKey,
  serverUrl,
  proxy,
  autProxy,
  renderInfo,
  snapshot,
  url,
  browsers = [{width: 1024, height: 768}],
  sizeMode = 'full-page',
  selector,
  region,
  scriptHooks,
}) {
  const snapshots = Array.isArray(snapshot) ? snapshot : Array(browsers.length).fill(snapshot)

  const renderingInfo = new RenderingInfo({
    serviceUrl: renderInfo.serviceUrl,
    accessToken: renderInfo.accessToken,
    resultsUrl: renderInfo.resultsUrl,
  })

  const {createResourceMapping, render, waitForRenderedStatus} = makeRenderer({
    apiKey,
    showLogs,
    serverUrl,
    proxy,
    autProxy,
    renderingInfo,
  })

  const renderRequests = await Promise.all(
    snapshots.map(async (snapshot, index) => {
      const {resourceUrls, resourceContents, frames, cdt} = deserializeDomSnapshotResult(snapshot)
      const {dom, resources} = await createResourceMapping({
        snapshot: {cdt, frames, resourceUrls, resourceContents},
      })
      return createRenderRequest({
        url,
        dom,
        resources,
        browser: browsers[index],
        renderInfo: renderingInfo,
        sizeMode,
        selector,
        region,
        scriptHooks,
        sendDom: true,
      })
    }),
  )

  const renderIds = await Promise.all(renderRequests.map(render))

  const renderStatusResults = await Promise.all(
    renderIds.map(renderId =>
      waitForRenderedStatus(renderId, () => false).then(({imageLocation}) => ({
        imageLocation,
        renderId,
      })),
    ),
  )

  return renderStatusResults
}

module.exports = takeScreenshot
