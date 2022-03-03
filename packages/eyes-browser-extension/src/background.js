import browser from 'webextension-polyfill'
import {makeSDK} from '@applitools/eyes-sdk-core'
import {makeMessenger} from './messenger'
import {makeRefer} from './refer'
import * as spec from './spec-driver'

window.browser = browser
window.spec = spec
window.sdk = makeSDK({
  name: 'eyes.browser-extension',
  version: require('../package.json').version,
  spec,
  VisualGridClient: require('@applitools/visual-grid-client'),
})

browser.tabs.onUpdated.addListener((tabId, change) => {
  if (change.status === 'complete') {
    const manager = refer.get(`manager-${tabId}`)
    if (manager) messenger.emit('Core.setManager', {manager}, {tabId})
    const eyes = refer.get(`eyes-${tabId}`)
    if (eyes) messenger.emit('Core.setEyes', {eyes}, {tabId})
  }
})

const refer = makeRefer()
const messenger = makeMessenger({
  onMessage: fn => browser.runtime.onMessage.addListener((message, sender) => fn(message, sender)),
  sendMessage: (message, receiver) =>
    browser.tabs.sendMessage(receiver.tabId ?? receiver.tab.id, message, {frameId: receiver.frameId}),
})

messenger.command('Core.makeManager', async (config, sender) => {
  const manager = await window.sdk.makeManager(config)
  const managerRef = refer.ref(manager, `manager-${sender.tab.id}`)
  messenger.emit('Core.setManager', {manager: managerRef}, {tabId: sender.tab.id})
  return managerRef
})
messenger.command('Core.openEyes', async (config, sender) => {
  const manager = await window.sdk.makeManager(config)
  const eyes = await manager.openEyes({
    driver: {tabId: sender.tab.id, windowId: sender.tab.windowId, frameId: sender.frameId},
    config: config.config,
    on: config.on,
  })
  const eyesRef = refer.ref(eyes, `eyes-${sender.tab.id}`)
  messenger.emit('Core.setEyes', {eyes: eyesRef}, {tabId: sender.tab.id})
  return eyesRef
})
messenger.command('Core.getViewportSize', async (_, sender) => {
  return window.sdk.getViewportSize({
    driver: {tabId: sender.tab.id, windowId: sender.tab.windowId},
  })
})
messenger.command('Core.setViewportSize', async ({size}, sender) => {
  return window.sdk.setViewportSize({
    driver: {tabId: sender.tab.id, windowId: sender.tab.windowId},
    size,
  })
})
messenger.command('Core.closeBatches', async settings => {
  return window.sdk.closeAllBatches(settings)
})
messenger.command('Core.deleteTest', async settings => {
  return window.sdk.deleteTest(settings)
})

messenger.command('EyesManager.openEyes', async ({manager, config, on}, sender) => {
  const eyes = await refer.deref(manager).openEyes({
    driver: {tabId: sender.tab.id, windowId: sender.tab.windowId, frameId: sender.frameId},
    config,
    on,
  })
  return refer.ref(eyes)
})
messenger.command('EyesManager.closeManager', async ({manager, throwErr}) => {
  return refer.deref(manager).closeManager({throwErr})
})

messenger.command('Eyes.check', async ({eyes, settings, config}) => {
  return refer.deref(eyes).check({settings, config})
})
messenger.command('Eyes.locate', async ({eyes, settings, config}) => {
  return refer.deref(eyes).locate({settings, config})
})
messenger.command('Eyes.extractTextRegions', async ({eyes, settings, config}) => {
  return refer.deref(eyes).extractTextRegions({settings, config})
})
messenger.command('Eyes.extractText', async ({eyes, regions, config}) => {
  return refer.deref(eyes).extractText({regions, config})
})
messenger.command('Eyes.close', async ({eyes, throwErr}) => {
  return refer.deref(eyes).close({throwErr})
})
messenger.command('Eyes.abort', async ({eyes}) => {
  return refer.deref(eyes).abort()
})
