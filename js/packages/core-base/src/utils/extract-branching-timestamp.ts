import {ExecOptions} from 'child_process'
import * as utils from '@applitools/utils'

export const extractBranchingTimestamp = utils.general.cachify(
  async (
    {branchName, parentBranchName}: {branchName: string; parentBranchName: string},
    options?: ExecOptions,
  ): Promise<string> => {
    const command = `HASH=$(git merge-base ${branchName} ${parentBranchName}) && git show -q --format=%cI $HASH`
    let result = await utils.process.execute(command, options)

    if (result.stderr) {
      const [, missingBranch] = result.stderr.match(/Not a valid object name ([^\s]+)/) ?? []
      if (missingBranch) {
        result = await utils.process.execute(`git fetch origin ${missingBranch}:${missingBranch} && ${command}`, options)
      }
    }

    if (!result.stdout) {
      result = await utils.process.execute(`git fetch origin --unshallow && ${command}`, options)
    }

    const timestamp = result.stdout.replace(/\s/g, '')
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}/.test(timestamp)) {
      throw new Error(`stderr: ${result.stderr}, stdout: ${result.stdout}`)
    }
    return timestamp
  },
)
