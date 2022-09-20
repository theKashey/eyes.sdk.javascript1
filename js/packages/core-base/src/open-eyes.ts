import type {OpenSettings, Eyes} from '@applitools/types/base'
import {type Logger} from '@applitools/logger'
import {type CoreRequests} from './server/requests'
import {extractBranchingTimestamp} from './utils/extract-branching-timestamp'
import {makeCheck} from './check'
import {makeCheckAndClose} from './check-and-close'
import {makeLocateText} from './locate-text'
import {makeExtractText} from './extract-text'
import {makeClose} from './close'
import {makeAbort} from './abort'

type Options = {
  requests: CoreRequests
  logger: Logger
  cwd: string
}

export function makeOpenEyes({requests, logger: defaultLogger, cwd = process.cwd()}: Options) {
  return async function openEyes({settings, logger = defaultLogger}: {settings: OpenSettings; logger?: Logger}): Promise<Eyes> {
    logger.log('Command "openEyes" is called with settings', settings)

    if (!settings.ignoreGitBranching) {
      if (!settings.gitBranchingTimestamp) {
        let branches = {branchName: settings.branchName, parentBranchName: settings.parentBranchName}
        try {
          if (settings.batch?.id && !branches.branchName && !branches.parentBranchName) {
            branches = await requests.getBatchBranches({settings: {...settings, batchId: settings.batch.id}})
          }
          if (branches.branchName && branches.parentBranchName && branches.branchName !== branches.parentBranchName) {
            settings.gitBranchingTimestamp = await extractBranchingTimestamp(branches, {cwd})
            logger.log('Branching timestamp successfully extracted', settings.gitBranchingTimestamp)
          }
        } catch (err) {
          logger.error('Error during extracting merge timestamp', err)
        }
      }
    } else {
      settings.gitBranchingTimestamp = undefined
    }

    const eyesRequests = await requests.openEyes({settings, logger})

    return {
      test: eyesRequests.test,
      get running() {
        return eyesRequests.running
      },
      get closed() {
        return eyesRequests.closed
      },
      get aborted() {
        return eyesRequests.aborted
      },
      check: makeCheck({requests: eyesRequests, logger}),
      checkAndClose: makeCheckAndClose({requests: eyesRequests, logger}),
      locateText: makeLocateText({requests: eyesRequests, logger}),
      extractText: makeExtractText({requests: eyesRequests, logger}),
      close: makeClose({requests: eyesRequests, logger}),
      abort: makeAbort({requests: eyesRequests, logger}),
    }
  }
}
