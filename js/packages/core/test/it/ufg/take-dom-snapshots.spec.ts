import {takeDomSnapshots} from '../../../src/ufg/utils/take-dom-snapshots'
import {makeLogger} from '@applitools/logger'
import {makeDriver} from '@applitools/driver'
import {MockDriver, spec} from '@applitools/driver/fake'
import {generateDomSnapshot} from '../../utils/generate-dom-snapshot'
import chalk from 'chalk'
import assert from 'assert'

describe('take-dom-snapshots', () => {
  let driver, logger, output

  beforeEach(async () => {
    const mock = new MockDriver({viewport: {width: 600, height: 700}})
    mock.mockScript('dom-snapshot', () => generateDomSnapshot(mock))
    mock.wrapMethod('setWindowRect', (method, mock, [rect]) => {
      if (!Number.isNaN(Number(rect.width))) {
        rect.width = Math.min(Math.max(rect.width, 300), 800)
      }
      if (!Number.isNaN(Number(rect.height))) {
        rect.height = Math.min(Math.max(rect.height, 500), 1000)
      }
      return method.call(mock, rect)
    })

    driver = await makeDriver({driver: mock, spec})

    output = []
    logger = makeLogger()
    logger.console = {
      log: (...chunks) => output.push(...chunks),
    }
  })

  it('warns if not able to resize to the renderer width', async () => {
    await takeDomSnapshots({
      driver,
      settings: {
        layoutBreakpoints: true,
        renderers: [
          {width: 200, height: 400, name: 'chrome'},
          {width: 700, height: 900, name: 'chrome'},
          {width: 1000, height: 1200, name: 'chrome'},
        ],
      },
      logger,
    })

    const warns = [
      `The following configurations [(chrome)] have a viewport-width of 200 pixels, while your local browser has a limit of 300 pixels, so the SDK couldn't resize it to the desired size. As a fallback, the resources that will be used for these checkpoints have been captured on the browser's limit (300 pixels). To resolve this, you may use a headless browser as it can be resized to any size.`,
      `The following configurations [(chrome)] have a viewport-width of 1000 pixels, while your local browser has a limit of 800 pixels, so the SDK couldn't resize it to the desired size. As a fallback, the resources that will be used for these checkpoints have been captured on the browser's limit (800 pixels). To resolve this, you may use a headless browser as it can be resized to any size.`,
    ]
    warns.forEach((warn, index) => {
      assert.strictEqual(output[index], chalk.yellow(warn))
    })
  })

  it('warns if not able to resize to the breakpoint width', async () => {
    await takeDomSnapshots({
      driver,
      settings: {
        layoutBreakpoints: [200, 700, 1000],
        renderers: [
          {width: 200, height: 400, name: 'chrome'},
          {width: 700, height: 900, name: 'chrome'},
          {width: 1000, height: 1200, name: 'chrome'},
        ],
      },
      logger,
    })

    const warns = [
      `One of the configured layout breakpoints is 200 pixels, while your local browser has a limit of 300, so the SDK couldn't resize it to the desired size. As a fallback, the resources that will be used for the following configurations: [(chrome, 200)] have been captured on the browser's limit (300 pixels). To resolve this, you may use a headless browser as it can be resized to any size.`,
      `One of the configured layout breakpoints is 1000 pixels, while your local browser has a limit of 800, so the SDK couldn't resize it to the desired size. As a fallback, the resources that will be used for the following configurations: [(chrome, 1000)] have been captured on the browser's limit (800 pixels). To resolve this, you may use a headless browser as it can be resized to any size.`,
    ]
    warns.forEach((warn, index) => {
      assert.strictEqual(output[index], chalk.yellow(warn))
    })
  })

  it('warns if renderer is smaller than the smallest breakpoint', async () => {
    await takeDomSnapshots({
      driver,
      settings: {
        layoutBreakpoints: [400, 500],
        renderers: [
          {width: 300, height: 400, name: 'chrome'},
          {width: 350, height: 400, name: 'chrome'},
          {width: 700, height: 900, name: 'chrome'},
        ],
      },
      logger,
    })
    const warns = [
      `The following configuration's viewport-widths are smaller than the smallest configured layout breakpoint (400 pixels): [(chrome, 300), (chrome, 350)]. As a fallback, the resources that will be used for these configurations have been captured on a viewport-width of 400 - 1 pixels. If an additional layout breakpoint is needed for you to achieve better results - please add it to your configuration.`,
    ]
    warns.forEach((warn, index) => {
      assert.strictEqual(output[index], chalk.yellow(warn))
    })
  })
})
