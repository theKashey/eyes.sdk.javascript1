import type * as types from '@applitools/types'

type GroupHistory = {
  manager: types.Ref
  config: Record<string, any>
  eyes: types.Ref[]
}

type TestHistory = {
  driver: Record<string, any>
  config: Record<string, any>
  commands: {name: string; input: Record<string, any>; result: any}[]
  result: Record<string, any>
  aborted: boolean
}

export interface Tracker {
  makeManager(config: any, manager: types.Ref): void
  makeEyes(input: any, eyes: types.Ref): void
  check(input: any, result: any): void
  locate(input: any, result: any): void
  extractTextRegions(input: any, result: any): void
  extractText(input: any, result: any): void
  close(input: any, result: any): void
  abort(input: any, result: any): void
  toJSON(): Record<string, any>
}

export function makeTracker({track = false} = {}): Tracker {
  const history = {
    managers: new Map<string, GroupHistory>(),
    eyes: new Map<string, TestHistory>(),
    startedAt: new Date().toISOString(),
  }

  function extractRefId(ref: types.Ref): string {
    return ref['applitools-ref-id']
  }

  const api = {
    makeManager(config: any, manager: types.Ref) {
      history.managers.set(extractRefId(manager), {manager, config, eyes: []})
    },
    makeEyes({manager, ...input}: any, eyes: types.Ref) {
      const managerHistory = history.managers.get(extractRefId(manager))
      if (!managerHistory) return
      managerHistory.eyes.push(eyes)
      history.eyes.set(extractRefId(eyes), {eyes, ...input, commands: []})
    },
    check({eyes, ...input}: any, result: any) {
      const eyesHistory = history.eyes.get(extractRefId(eyes))
      if (!eyesHistory) return
      eyesHistory.commands.push({name: 'check', ...input, result})
    },
    locate({eyes, ...input}: any, result: any) {
      const eyesHistory = history.eyes.get(extractRefId(eyes))
      if (!eyesHistory) return
      eyesHistory.commands.push({name: 'locate', ...input, result})
    },
    extractTextRegions({eyes, ...input}: any, result: any) {
      const eyesHistory = history.eyes.get(extractRefId(eyes))
      if (!eyesHistory) return
      eyesHistory.commands.push({name: 'extractTextRegions', ...input, result})
    },
    extractText({eyes, ...input}: any, result: any) {
      const eyesHistory = history.eyes.get(extractRefId(eyes))
      if (!eyesHistory) return
      eyesHistory.commands.push({name: 'extractText', ...input, result})
    },
    close({eyes}: any, result: any) {
      const eyesHistory = history.eyes.get(extractRefId(eyes))
      if (!eyesHistory) return
      eyesHistory.result = result
      eyesHistory.aborted = false
    },
    abort({eyes}: any, result: any) {
      const eyesHistory = history.eyes.get(extractRefId(eyes))
      if (!eyesHistory) return
      eyesHistory.result = result
      eyesHistory.aborted = true
    },
    toJSON() {
      return {
        managers: Array.from(history.managers.values(), manager => ({
          ...manager,
          eyes: manager.eyes.map(eyes => history.eyes.get(extractRefId(eyes))),
        })),
        startedAt: history.startedAt,
        requestedAt: new Date().toISOString(),
      }
    },
  }

  if (!track) {
    return Object.keys(api).reduce((api, method) => Object.assign(api, {[method]: () => void 0}), {} as Tracker)
  }

  return api
}
