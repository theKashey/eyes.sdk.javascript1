import type {ServerSettings} from '../types'
import {type Logger} from '@applitools/logger'
import {type Driver} from '@applitools/driver'
import {type Renderer, type AndroidSnapshot, type IOSSnapshot} from '@applitools/ufg-client'
import * as utils from '@applitools/utils'

export type VHSesSettings = ServerSettings & {renderers: Renderer[]; waitBeforeCapture?: number}

export async function takeVHSes<TDriver extends Driver<unknown, unknown, unknown, unknown>>({
  driver,
  settings,
  hooks,
  logger,
}: {
  driver: TDriver
  settings?: VHSesSettings
  hooks?: {beforeSnapshots?(): void | Promise<void>; beforeEachSnapshot?(): void | Promise<void>}
  logger: Logger
}): Promise<AndroidSnapshot[] | IOSSnapshot[]> {
  logger.log('taking VHS')

  if (!driver.isAndroid && !driver.isIOS) {
    throwError('cannot take VHS on mobile device other than iOS or Android')
  }

  await hooks?.beforeSnapshots?.()

  const trigger = await findElement({
    driver,
    selector: 'UFG_TriggerArea',
    type: 'Button',
    timeout: 30000,
  })

  if (driver.isAndroid) {
    const apiKeyInput = await findElement({
      driver,
      selector: 'UFG_Apikey',
      type: 'EditText',
      throwErr: false,
    })
    if (apiKeyInput) {
      // in case 'apiKeyInput' does not exist, it means it was already triggered on previous cycle
      // this condition is to avoid re-sending 'inputJson' multiple times
      const inputString = JSON.stringify({
        serverUrl: settings.serverUrl || undefined,
        apiKey: settings.apiKey,
        proxy: settings.proxy ? transformProxy(settings.proxy) : undefined,
      })
      log('sending API key to UFG lib', inputString)
      await apiKeyInput.type(inputString)
      const ready = await findElement({
        driver,
        selector: 'UFG_ApikeyReady',
        type: 'Button',
      })
      await ready.click()
    } else {
      log('UFG_Apikey was skipped')
    }
  }

  await trigger.click() // TODO handle stale element exception and then find the trigger again and click it

  let label = await findElement({
    driver,
    selector: 'UFG_SecondaryLabel',
    type: 'TextView',
    timeout: 10000,
    throwErr: false,
  })
  if (!label) {
    // This might happen if the tap on the trigger area didn't happen due to Appium bug. So we try to find the trigger again and if it's present, we'll tap it.
    // If the trigger area is not present, then we're probably at the middle of taking the VHS - give it 50 seconds more until we give up
    log('UFG_SecondaryLabel was not found after 10 seconds, trying to click UFG_TriggerArea again')
    const triggerRetry = await findElement({
      driver,
      selector: 'UFG_TriggerArea',
      type: 'Button',
      timeout: 30000,
      throwErr: false,
    })
    if (triggerRetry) {
      log('UFG_TriggerArea was found on retry. clicking it.')
      await triggerRetry.click()
    } else {
      log('UFG_TriggerArea was NOT found on retry. Probably VHS is being taken.')
    }
    label = await findElement({
      driver,
      selector: 'UFG_SecondaryLabel',
      type: 'TextView',
      timeout: 50000,
    })
    if (!label) {
      log('UFG_SecondaryLabel was not found eventually. Giving up.')
    }
  }
  const info = JSON.parse(await label.getText())

  log('VHS info', info)

  if (info.error) {
    throwError(info.error)
  }

  let vhs
  if (driver.isIOS) {
    vhs = await extractVHS()
  } else if (info.mode === 'labels') {
    vhs = await collectChunkedVHS({count: info.partsCount})
  } else if (info.mode === 'network') {
    // do nothing
  } else {
    throwError(`unknown mode for android: ${info.mode}`)
  }

  const clear = await findElement({
    driver,
    selector: 'UFG_ClearArea',
    type: 'Button',
    timeout: 30000,
  })
  await clear.click()

  let snapshot: AndroidSnapshot | IOSSnapshot

  if (driver.isAndroid) {
    snapshot = {
      platformName: 'android',
      vhsType: info.flavorName,
      vhsHash: {
        hashFormat: 'sha256',
        hash: info.vhsHash,
        contentType: `x-applitools-vhs/${info.flavorName}`,
      },
    }
  } else {
    snapshot = {
      platformName: 'ios',
      resourceContents: {
        vhs: {
          value: Buffer.from(vhs, 'base64'),
          type: 'x-applitools-vhs/ios',
        },
      },
      vhsCompatibilityParams: {
        UIKitLinkTimeVersionNumber: info.UIKitLinkTimeVersionNumber,
        UIKitRunTimeVersionNumber: info.UIKitRunTimeVersionNumber,
      },
    }
  }

  return Array(settings.renderers.length).fill(snapshot)

  async function extractVHS() {
    const label = await findElement({
      driver,
      selector: 'UFG_Label',
      type: 'TextView',
    })
    return await label.getText()
  }

  async function collectChunkedVHS({count}) {
    const labels = [
      await findElement({
        driver,
        selector: 'UFG_Label_0',
        type: 'TextView',
      }),
      await findElement({
        driver,
        selector: 'UFG_Label_1',
        type: 'TextView',
      }),
      await findElement({
        driver,
        selector: 'UFG_Label_2',
        type: 'TextView',
      }),
    ]

    let vhs = ''
    for (let chunk = 0; chunk < count / labels.length; ++chunk) {
      for (let label = 0; label < Math.min(labels.length, count - chunk * labels.length); ++label) {
        vhs += await labels[label].getText()
      }

      if (chunk * labels.length < count) {
        await trigger.click()
      }
    }
    return vhs
  }

  function log(...msg) {
    logger.log('[takeVHSes]', ...msg)
  }
}

function transformProxy(proxy: any) {
  const url = new URL(proxy.url)
  const transformedProxy = {
    protocol: url.protocol,
    host: url.hostname,
    port: url.port,
  } as any
  if (proxy.username) {
    transformedProxy.auth = {username: proxy.username, password: proxy.password}
  } else if (url.username) {
    transformedProxy.auth = {username: url.username, password: proxy.password}
  }
  return transformedProxy
}

function throwError(msg) {
  throw new Error(`Error while taking VHS - ${msg}`)
}

async function findElement(options) {
  const {selector, timeout = 0, throwErr = true} = options

  let element = await findElementBySelector(options)
  if (!element && timeout) element = await waitFor(options)
  if (!element && throwErr) {
    const timeoutError = timeout ? `, (waited for ${timeout} ms)` : '.'
    throwError(`${selector} element could not be found${timeoutError}`)
  }
  return element

  async function waitFor(options) {
    const {timeout} = options
    const interval = 500
    let waiting = true
    const waitTime = setTimeout(() => (waiting = false), timeout)
    while (waiting) {
      const element = await findElementBySelector(options)
      if (element) {
        clearTimeout(waitTime)
        return element
      }
      await utils.general.sleep(interval)
    }
    return null
  }

  async function findElementBySelector(options) {
    const {driver, selector, type} = options
    const context = driver.currentContext
    let element
    if (driver.isAndroid) {
      element = await driver.element({
        type: 'xpath',
        selector: `//android.widget.${type}[@content-desc="${selector}"]`,
      })
    } else {
      element = await context.element({type: 'accessibility id', selector})
    }
    return element
  }
}
