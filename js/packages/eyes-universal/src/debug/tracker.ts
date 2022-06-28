import type * as types from '@applitools/types'
import type {Socket} from '../socket'

type GroupHistory = {
  manager: types.Ref
  eyes: (types.Ref | Error)[]
}

type TestHistory = {
  driver: Record<string, any>
  config: Record<string, any>
  commands: {name: string; input: Record<string, any>; result: any}[]
  result: Record<string, any>
  aborted: boolean
}

export function withTracker<TSocket extends Socket>(options: {
  socket: TSocket
  debug?: boolean
}): TSocket & {getHistory?(): Record<string, any>} {
  const socket = options.socket as TSocket & {getHistory?(): Record<string, any>}
  if (!options.debug) return socket

  const history = {
    managers: new Map<string, GroupHistory>(),
    eyes: new Map<string, TestHistory>(),
    startedAt: new Date().toISOString(),
  }

  const originalCommand = socket.command
  socket.command = function command(name, fn) {
    return originalCommand(name, async payload => {
      let result, error
      try {
        result = await fn(payload)
        return result
      } catch (err) {
        error = err
        throw error
      } finally {
        if (name === 'Core.makeManager') {
          const managerRef = result
          history.managers.set(extractRefId(managerRef), {...payload, manager: result, eyes: []})
        } else if (name === 'EyesManager.openEyes') {
          const managerRef = payload.manager
          const managerHistory = history.managers.get(extractRefId(managerRef))
          if (error) {
            managerHistory.eyes.push({...payload, error})
          } else {
            const eyesRef = result
            managerHistory.eyes.push(eyesRef)
            history.eyes.set(extractRefId(eyesRef), {...payload, eyes: eyesRef, commands: []})
          }
        } else if (/Eyes\.(check|locate|extractText|extractTextRegions)/.test(name)) {
          const eyesRef = payload.eyes
          const eyesHistory = history.eyes.get(extractRefId(eyesRef))
          if (eyesHistory) {
            const command = {name, ...payload}
            if (error) command.error = error
            else command.result = result
            eyesHistory.commands.push(command)
          }
        } else if (/Eyes\.(close|abort)/.test(name)) {
          const eyesRef = payload.eyes
          const eyesHistory = history.eyes.get(extractRefId(eyesRef))
          if (eyesHistory) {
            eyesHistory.aborted = name.endsWith('abort')
            eyesHistory.result = error ?? result
          }
        }
      }
    })
  }

  socket.getHistory = function getHistory() {
    return {
      managers: Array.from(history.managers.values(), managerMeta => ({
        ...managerMeta,
        eyes: managerMeta.eyes.map(eyesRefOrError => {
          return eyesRefOrError instanceof Error ? eyesRefOrError : history.eyes.get(extractRefId(eyesRefOrError))
        }),
      })),
      startedAt: history.startedAt,
      requestedAt: new Date().toISOString(),
    }
  }

  return socket

  function extractRefId(ref: types.Ref): string {
    return ref['applitools-ref-id']
  }
}
