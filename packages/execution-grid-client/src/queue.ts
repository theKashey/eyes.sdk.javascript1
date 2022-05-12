import {type Logger} from '@applitools/logger'

export type Queue = {
  run<TResult>(task: () => Promise<TResult>): Promise<TResult>
}

export function makeQueue({logger}: {logger: Logger}): Queue {
  const queue = []

  return {run}

  async function run(task: () => Promise<any>): Promise<any> {
    // if (que)
    if (queue.length === 1) {
      try {
        return await task()
      } finally {
      }
    }
  }
}
