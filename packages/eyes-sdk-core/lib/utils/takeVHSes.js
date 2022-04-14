async function takeVHSes({driver, browsers, apiKey, serverUrl, proxy, waitBeforeCapture, logger}) {
  log('taking VHS')

  if (!driver.isAndroid && !driver.isIOS) {
    throwError('cannot take VHS on mobile device other than iOS or Android')
  }

  if (waitBeforeCapture) await waitBeforeCapture()

  const context = driver.currentContext

  const trigger = await context.waitFor({type: 'accessibility id', selector: 'UFG_TriggerArea'}, {timeout: 30000})
  if (!trigger) {
    throwError('UFG_TriggerArea element could not be found')
  }

  if (driver.isAndroid) {
    const apiKeyInput = await context.element({type: 'accessibility id', selector: 'UFG_Apikey'})
    if (apiKeyInput) {
      // in case 'apiKeyInput' does not exist, it means it was already triggered on previous cycle
      // this condition is to avoid re-sending 'inputJson' multiple times
      const proxyObject = proxy && proxy.toProxyObject()
      const inputJson = {
        apiKey,
      }
      if (serverUrl) inputJson.serverUrl = serverUrl
      if (proxyObject) inputJson.proxy = proxyObject
      const inputString = JSON.stringify(inputJson)
      log('sending API key to UFG lib', inputString)
      await apiKeyInput.type(inputString)
      const ready = await context.element({type: 'accessibility id', selector: 'UFG_ApikeyReady'})
      if (!ready) {
        throwError('UFG_ApikeyReady element could not be found')
      }
      await ready.click()
    } else {
      log('UFG_Apikey was skipped')
    }
  }

  await trigger.click() // TODO handle stale element exception and then find the trigger again and click it

  let label = await context.waitFor({type: 'accessibility id', selector: 'UFG_SecondaryLabel'}, {timeout: 10000})
  if (!label) {
    // This might happen if the tap on the trigger area didn't happen due to Appium bug. So we try to find the trigger again and if it's present, we'll tap it.
    // If the trigger area is not present, then we're probably at the middle of taking the VHS - give it 50 seconds more until we give up
    log('UFG_SecondaryLabel was not found after 10 seconds, trying to click UFG_TriggerArea again')
    const triggerRetry = await context.element({type: 'accessibility id', selector: 'UFG_TriggerArea'})
    if (triggerRetry) {
      log('UFG_TriggerArea was found on retry. clicking it.')
      await triggerRetry.click()
    } else {
      log('UFG_TriggerArea was NOT found on retry. Probably VHS is being taken.')
    }

    label = await context.waitFor({type: 'accessibility id', selector: 'UFG_SecondaryLabel'}, {timeout: 50000})
  }

  if (!label) {
    log('UFG_SecondaryLabel was not found eventually. Giving up.')
    throwError('UFG_SecondaryLabel element could not be found')
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

  const clear = await context.element({type: 'accessibility id', selector: 'UFG_ClearArea'})
  if (!clear) {
    throwError('UFG_ClearArea element could not be found')
  }
  await clear.click()

  let snapshot

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

  return {snapshots: Array(browsers.length).fill(snapshot)}

  async function extractVHS() {
    const label = await context.element({type: 'accessibility id', selector: 'UFG_Label'})
    return await label.getText()
  }

  async function collectChunkedVHS({count}) {
    const labels = [
      await context.element({type: 'accessibility id', selector: 'UFG_Label_0'}),
      await context.element({type: 'accessibility id', selector: 'UFG_Label_1'}),
      await context.element({type: 'accessibility id', selector: 'UFG_Label_2'}),
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

function throwError(msg) {
  throw new Error(`Error while taking VHS - ${msg}`)
}

module.exports = takeVHSes
