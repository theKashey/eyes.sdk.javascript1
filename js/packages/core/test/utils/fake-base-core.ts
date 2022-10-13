import type {Core as BaseCore} from '@applitools/core-base'
import * as utils from '@applitools/utils'
import EventEmitter from 'events'

export function makeFakeCore({hooks}: any = {}): BaseCore & EventEmitter {
  const emitter = new EventEmitter()
  return <any>{
    on: emitter.on.bind(emitter),
    once: emitter.once.bind(emitter),
    off: emitter.off.bind(emitter),
    async getAccountInfo() {
      emitter.emit('getAccountInfo')
      await hooks?.getAccountInfo?.()
      return {}
    },
    async logEvent() {
      emitter.emit('logEvent')
      return {}
    },
    async openEyes(options) {
      emitter.emit('beforeOpenEyes', options)
      try {
        await utils.general.sleep(10)
        await hooks?.openEyes?.(options)
        const {settings = {}} = options
        const environment = settings.environment
        const steps = []
        let aborted = false
        let closed = false
        return {
          test: {isNew: true},
          get running() {
            return !closed && !aborted
          },
          get closed() {
            return closed
          },
          get aborted() {
            return aborted
          },
          async check(options) {
            emitter.emit('beforeCheck', options)
            try {
              await utils.general.sleep(10)
              await hooks?.check?.(options)
              const {target, settings} = options
              if (settings.name?.startsWith('fail')) {
                throw new Error('Received fail step name')
              }
              const result = {asExpected: !settings.name?.startsWith('diff'), target, settings, environment}
              steps.push(result)
              return [result]
            } finally {
              emitter.emit('afterCheck', options)
            }
          },
          async close(options) {
            emitter.emit('beforeClose', options)
            try {
              closed = true
              await utils.general.sleep(10)
              await hooks?.close?.(options)
              return [
                {
                  status: steps.every(result => result.asExpected) ? 'Passed' : 'Unresolved',
                  stepsInfo: steps,
                },
              ]
            } finally {
              emitter.emit('afterClose', options)
            }
          },
          async abort(options) {
            emitter.emit('beforeAbort', options)
            try {
              aborted = true
              await utils.general.sleep(10)
              await hooks?.abort?.(options)
              return [{isAborted: true}]
            } finally {
              emitter.emit('afterAbort', options)
            }
          },
        }
      } finally {
        emitter.emit('afterOpenEyes', options)
      }
    },
  }
}
