import {spawn, SpawnOptions} from 'child_process'

function makeError(error: string | Error, properties: Record<string, any>) {
  if (typeof error === 'string') {
    error = new Error(error)
  }
  if (!properties) return error

  return Object.assign(error, properties)
}

export function executeAndControlProcess(
  command: string,
  args: any[] = [],
  options?: {spawnOptions?: SpawnOptions; timeout?: number},
) {
  const subProcess = spawn(command, args, {
    stdio: 'pipe',
    ...options?.spawnOptions,
  })

  const exitPromise = new Promise((resolve, reject) => {
    subProcess.on('error', reject).on('close', (exitCode, signal) =>
      exitCode === 0
        ? resolve({exitCode, stdout, stderr})
        : signal
        ? reject(
            makeError(
              new Error(
                `process exited due to signal ${signal} executing process ${command} with args ${JSON.stringify(args)}`,
              ),
              {
                signal,
                stdout,
                stderr,
              },
            ),
          )
        : reject(
            makeError(
              new Error(
                `non-zero exit code (${exitCode}) executing process ${command} with args ${JSON.stringify(args)}`,
              ),
              {
                exitCode,
                stdout,
                stderr,
              },
            ),
          ),
    )

    let stdout = subProcess.stdout ? '' : undefined
    let stderr = subProcess.stderr ? '' : undefined
    subProcess.stdout && subProcess.stdout.on('data', data => (stdout += data.toString()))
    subProcess.stderr && subProcess.stderr.on('data', data => (stderr += data.toString()))

    if (options?.timeout) {
      setTimeout(() => subProcess.kill(), options.timeout)
    }
    return {stdout, stderr}
  })

  return {subProcess, exitPromise}
}

export async function executeProcess(
  command: string,
  args: any[] = [],
  options?: {spawnOptions?: SpawnOptions; timeout?: number},
) {
  return await executeAndControlProcess(command, args, options).exitPromise
}

export async function sh(command: string, options?: {spawnOptions?: SpawnOptions; timeout?: number}) {
  return await executeProcess(command, [], {
    ...options,
    spawnOptions: {
      stdio: 'inherit',
      shell: process.platform === 'win32' ? 'C:\\Program Files\\Git\\bin\\bash.exe' : '/bin/bash',
      ...options?.spawnOptions,
    },
  })
}
