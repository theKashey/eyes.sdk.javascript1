const {expect} = require('chai')
const {startFakeEyesServer, getSession} = require('@applitools/sdk-fake-eyes-server')
const {MockDriver} = require('@applitools/driver/fake')
const {EyesClassic, EyesVisualGrid} = require('../utils/FakeSDK')
const TestResults = require('../../lib/TestResults')
const {generateScreenshot} = require('../utils/FakeScreenshot')
const {generateDomSnapshot} = require('../utils/FakeDomSnapshot')

// TODO: see if there is a way to get correct region coordinates when running
// in the grid with the mock driver.
describe('codedRegions', () => {
  for (const name of ['classic', 'vg']) {
    //for (const name of ['vg']) {
    //for (const name of ['classic']) {
    describe(name, async () => {
      let server, serverUrl, driver, eyes

      before(async () => {
        driver = new MockDriver()
        driver.mockElements([
          {selector: 'element0', rect: {x: 1, y: 2, width: 500, height: 501}},
          {selector: 'element1', rect: {x: 10, y: 11, width: 101, height: 102}},
          {selector: 'element2', rect: {x: 20, y: 21, width: 201, height: 202}},
          {selector: 'element3', rect: {x: 30, y: 31, width: 301, height: 302}},
          {selector: 'element4', rect: {x: 40, y: 41, width: 401, height: 402}},
        ])
        if (name === 'classic') {
          driver.takeScreenshot = generateScreenshot
          eyes = new EyesClassic()
        } else if (name === 'vg') {
          driver.mockScript('dom-snapshot', () => generateDomSnapshot(driver))
          eyes = new EyesVisualGrid()
        }
        server = await startFakeEyesServer({logger: eyes._logger, matchMode: 'always'})
        serverUrl = `http://localhost:${server.port}`
        eyes.setServerUrl(serverUrl)
      })

      after(async () => {
        await server.close()
      })

      it('regionId can be specified in check settings', async () => {
        await eyes.open(driver, 'FakeApp', 'FakeTest')
        const regionId = 'blah'
        await eyes.check({
          ignoreRegions: [
            {region: 'element1', regionId},
            {region: 'element2', regionId},
          ],
        })
        const [results] = await eyes.close()
        const regions = (await extractRegions(results, serverUrl))[0]
        expect(regions.ignore[0].regionId).to.be.deep.equal(`${regionId} (1)`)
        expect(regions.ignore[1].regionId).to.be.deep.equal(`${regionId} (2)`)
      })

      it('check window', async () => {
        await eyes.open(driver, 'FakeApp', 'FakeTest')
        const ignore = {x: 0, y: 1, width: 11, height: 12}
        const floating = await driver.findElement('element1')
        const accessibility = 'element2'
        const strict = {x: 90, y: 91, width: 91, height: 92}
        const content = await driver.findElement('element3')
        const layout = 'element4'
        await eyes.check({
          ignoreRegions: [ignore],
          floatingRegions: [{region: floating, maxUpOffset: 4, maxDownOffset: 3, maxLeftOffset: 2, maxRightOffset: 1}],
          accessibilityRegions: [accessibility],
          strictRegions: [strict],
          contentRegions: [content],
          layoutRegions: [layout],
        })
        const [results] = await eyes.close()
        const regions = (await extractRegions(results, serverUrl))[0]
        if (name === 'classic') {
          expect(regions.ignore).to.be.deep.equal([ignoreRegion(ignore)])
          expect(regions.floating).to.be.deep.equal([floatingRegion(floating.rect, 4, 3, 2, 1, 'element1')])
          expect(regions.accessibility).to.be.deep.equal([
            accessibilityRegion(await driver.findElement(accessibility).then(element => element.rect), 'element2'),
          ])
          expect(regions.strict).to.be.deep.equal([strictRegion(strict)])
          expect(regions.content).to.be.deep.equal([contentRegion(content.rect, 'element3')])
          expect(regions.layout).to.be.deep.equal([
            layoutRegion(await driver.findElement(layout).then(element => element.rect), 'element4'),
          ])
        } else if (name === 'vg') {
          expect(regions.ignore).to.be.deep.equal([ignoreRegion(ignore)])
          expect(regions.floating).to.be.deep.equal([
            floatingRegion({x: 1, y: 2, width: 3, height: 4}, 4, 3, 2, 1, 'element1'),
          ])
          expect(regions.accessibility).to.be.deep.equal([
            accessibilityRegion({x: 1, y: 2, width: 3, height: 4}, 'element2'),
          ])
          expect(regions.strict).to.be.deep.equal([strictRegion(strict)])
          expect(regions.content).to.be.deep.equal([contentRegion({x: 1, y: 2, width: 3, height: 4}, 'element3')])
          expect(regions.layout).to.be.deep.equal([layoutRegion({x: 1, y: 2, width: 3, height: 4}, 'element4')])
        }
      })

      it('check region', async () => {
        await eyes.open(driver, 'FakeApp', 'FakeTest')
        const region = await driver.findElement('element0')
        const ignore = {x: 0, y: 1, width: 11, height: 12}
        const floating = await driver.findElement('element1')
        const accessibility = 'element2'
        const strict = {x: 90, y: 91, width: 91, height: 92}
        const content = await driver.findElement('element3')
        const layout = 'element4'
        await eyes.check({
          region,
          ignoreRegions: [ignore],
          floatingRegions: [{region: floating, maxUpOffset: 4, maxDownOffset: 3, maxLeftOffset: 2, maxRightOffset: 1}],
          accessibilityRegions: [accessibility],
          strictRegions: [strict],
          contentRegions: [content],
          layoutRegions: [layout],
        })
        const [results] = await eyes.close()
        const regions = (await extractRegions(results, serverUrl))[0]
        if (name === 'classic') {
          expect(regions.ignore).to.be.deep.equal([ignoreRegion(ignore)])
          expect(regions.floating).to.be.deep.equal([
            relatedRegion(floatingRegion(floating.rect, 4, 3, 2, 1, 'element1'), region.rect),
          ])
          expect(regions.accessibility).to.be.deep.equal([
            relatedRegion(
              accessibilityRegion(await driver.findElement(accessibility).then(element => element.rect), 'element2'),
              region.rect,
            ),
          ])
          expect(regions.strict).to.be.deep.equal([strictRegion(strict)])
          expect(regions.content).to.be.deep.equal([
            relatedRegion(contentRegion(content.rect, 'element3'), region.rect),
          ])
          expect(regions.layout).to.be.deep.equal([
            relatedRegion(
              layoutRegion(await driver.findElement(layout).then(element => element.rect), 'element4'),
              region.rect,
            ),
          ])
        } else if (name === 'vg') {
          expect(regions.ignore).to.be.deep.equal([ignoreRegion(ignore)])
          expect(regions.floating).to.be.deep.equal([
            relatedRegion(floatingRegion({x: 2, y: 4, width: 3, height: 4}, 4, 3, 2, 1, 'element1'), region.rect),
          ])
          expect(regions.accessibility).to.be.deep.equal([
            relatedRegion(accessibilityRegion({x: 2, y: 4, width: 3, height: 4}, 'element2'), region.rect),
          ])
          expect(regions.strict).to.be.deep.equal([strictRegion(strict)])
          expect(regions.content).to.be.deep.equal([
            relatedRegion(contentRegion({x: 2, y: 4, width: 3, height: 4}, 'element3'), region.rect),
          ])
          expect(regions.layout).to.be.deep.equal([
            relatedRegion(layoutRegion({x: 2, y: 4, width: 3, height: 4}, 'element4'), region.rect),
          ])
        }
      })

      it('check region with padding', async () => {
        await eyes.open(driver, 'FakeApp', 'FakeTest')
        const region = await driver.findElement('element0')
        const ignore = await driver.findElement('element3')
        const ignoreAreaPadding = {left: 10, top: 10}
        const layout = 'element4'
        const layoutAreaPadding = 15
        await eyes.check({
          region,
          ignoreRegions: [ignore],
          layoutRegions: [{region: layout}],
        })
        await eyes.check({
          region,
          ignoreRegions: [{region: ignore, padding: ignoreAreaPadding}],
          layoutRegions: [{region: layout, padding: layoutAreaPadding}],
        })
        const [results] = await eyes.close()
        const regions = await extractRegions(results, serverUrl)
        const firstResult = regions[0]
        const secondResult = regions[1]
        expect(secondResult.ignore[0]).to.be.deep.equal(
          getRectWithPadding(firstResult.ignore[0], ignoreAreaPadding, 'element3'),
        )
        expect(secondResult.layout[0]).to.be.deep.equal(
          getRectWithPadding(firstResult.layout[0], layoutAreaPadding, 'element4'),
        )
      })
    })
  }
})

function getRectWithPadding(rect, padding, regionId) {
  if (!padding) {
    return rect
  }
  const setToAll = typeof padding !== 'object'
  return {
    x: rect.x - (setToAll ? padding : padding.left || 0),
    y: rect.y - (setToAll ? padding : padding.top || 0),
    width: rect.width + (setToAll ? padding * 2 : (padding.left || 0) + (padding.right || 0)),
    height: rect.height + (setToAll ? padding * 2 : (padding.top || 0) + (padding.bottom || 0)),
    regionId,
  }
}

async function extractRegions(results, serverUrl) {
  const session = await getSession(new TestResults(results), serverUrl)
  return session.steps.map(step => {
    const imageMatchSettings = step.matchWindowData.options.imageMatchSettings
    return {
      ignore: imageMatchSettings.ignore.map(ignoreRegion),
      floating: imageMatchSettings.floating.map(floatingRegion),
      accessibility: imageMatchSettings.accessibility.map(accessibilityRegion),
      strict: imageMatchSettings.strict.map(strictRegion),
      content: imageMatchSettings.content.map(contentRegion),
      layout: imageMatchSettings.layout.map(layoutRegion),
    }
  })
}

function ignoreRegion(region, regionId) {
  return {
    x: region.x || region.left || 0,
    y: region.y || region.top || 0,
    width: region.width,
    height: region.height,
    regionId: region.regionId || regionId || undefined,
  }
}

function floatingRegion(region, maxUpOffset, maxDownOffset, maxLeftOffset, maxRightOffset, regionId) {
  return {
    x: region.x || region.left || 0,
    y: region.y || region.top || 0,
    width: region.width,
    height: region.height,
    maxUpOffset: region.maxUpOffset || maxUpOffset,
    maxDownOffset: region.maxDownOffset || maxDownOffset,
    maxLeftOffset: region.maxLeftOffset || maxLeftOffset,
    maxRightOffset: region.maxRightOffset || maxRightOffset,
    regionId: region.regionId || regionId || undefined,
  }
}

function accessibilityRegion(region, regionId) {
  return {
    x: region.x || region.left || 0,
    y: region.y || region.top || 0,
    width: region.width,
    height: region.height,
    regionId: region.regionId || regionId || undefined,
  }
}

function strictRegion(region) {
  return {
    x: region.x || region.left || 0,
    y: region.y || region.top || 0,
    width: region.width,
    height: region.height,
  }
}

function contentRegion(region, regionId) {
  return {
    x: region.x || region.left || 0,
    y: region.y || region.top || 0,
    width: region.width,
    height: region.height,
    regionId: region.regionId || regionId || undefined,
  }
}

function layoutRegion(region, regionId) {
  return {
    x: region.x || region.left || 0,
    y: region.y || region.top || 0,
    width: region.width,
    height: region.height,
    regionId: region.regionId || regionId || undefined,
  }
}

function relatedRegion(region, parent) {
  return {
    ...region,
    x: region.x - parent.x,
    y: region.y - parent.y,
  }
}
