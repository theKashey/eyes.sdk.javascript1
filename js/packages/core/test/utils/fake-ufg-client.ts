import {type UFGClient} from '@applitools/ufg-client'
import * as utils from '@applitools/utils'
import EventEmitter from 'events'

const selectors = {
  sel1: {region: {x: 1, y: 2, width: 3, height: 4}},
  sel2: {region: {x: 5, y: 6, width: 7, height: 8}},
  sel3: {region: {x: 100, y: 101, width: 102, height: 103}},
  sel4: {region: {x: 200, y: 201, width: 202, height: 203}},
  sel5: {region: {x: 300, y: 301, width: 302, height: 303}},
  sel6: {region: {x: 400, y: 401, width: 402, height: 403}},
  sel7: {region: {x: 500, y: 501, width: 502, height: 503}},
  sel8: {region: {x: 600, y: 601, width: 602, height: 603}},
  sel9: {region: {x: 604, y: 604, width: 604, height: 604}},
  sel10: {region: {x: 605, y: 605, width: 605, height: 605}},
}

export function makeFakeClient({hooks}: any = {}): UFGClient & EventEmitter {
  const emitter = new EventEmitter()
  return <any>{
    on: emitter.on.bind(emitter),
    once: emitter.once.bind(emitter),
    off: emitter.off.bind(emitter),
    async createRenderTarget(options) {
      emitter.emit('beforeCreateRenderTarget', options)
      try {
        await utils.general.sleep(10)
        await hooks?.createRenderTarget?.(options)
        const {snapshot} = options
        return snapshot
      } finally {
        emitter.emit('afterCreateRenderTarget', options)
      }
    },
    async bookRenderer(options) {
      emitter.emit('beforeBookRenderer', options)
      try {
        await utils.general.sleep(10)
        await hooks?.bookRenderer?.(options)
        const {settings} = options
        const renderer = settings.renderer as any
        const deviceName = renderer.chromeEmulationInfo ?? renderer.iosDeviceInfo ?? renderer.androidDeviceInfo
        const browserName = renderer.name
        return {
          rendererId: 'renderer-uid',
          rawEnvironment: {
            os: 'os',
            osInfo: 'os',
            hostingApp: browserName,
            hostingAppInfo: browserName,
            deviceInfo: deviceName ?? 'Desktop',
            inferred: `useragent:${browserName}`,
            displaySize: deviceName ? {width: 400, height: 655} : {width: renderer.width, height: renderer.height},
          },
        }
      } finally {
        emitter.emit('afterBookRenderer', options)
      }
    },
    async render(options) {
      emitter.emit('beforeRender', options)
      try {
        await utils.general.sleep(0)
        await hooks?.render?.(options)
        const {target, settings} = options.request
        return {
          renderId: 'render-id',
          status: 'rendered',
          image: target as any as string,
          selectorRegions: settings.selectorsToCalculate.map(() => [{x: 0, y: 0, width: 100, height: 100}]),
          locationInViewport: settings.region
            ? utils.geometry.location(selectors[settings.region]?.region ?? settings.region)
            : {x: 0, y: 0},
        }
      } finally {
        emitter.emit('afterRender', options)
      }
    },
  }
}
