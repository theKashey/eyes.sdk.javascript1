#!/usr/bin/env node
const {spawn} = require('child_process')

const numberOfTests = Number(process.argv[2] - '')
if (Number.isNaN(numberOfTests)) {
  console.error('arg must be number')
  process.exit(1)
}

const stressProcess = []

function exec(...args) {
  return new Promise(res => {
    const p = spawn(args.join(' '), {
      detached: true,
      shell: process.platform === 'win32' ? 'C:\\Program Files\\Git\\bin\\bash.exe' : '/bin/sh',
      stdio: ['ignore', 'pipe', 'inherit'],
    })
    p.stdout.on('data', data => {
      console.log(p.pid, `${data.toString()}`)
    })
    p.on('exit', res)
  })
}
for (let i = 0; i < numberOfTests; i++) stressProcess.push(exec('npx ts-node ./test/stress/index.ts'))
;(async () => await Promise.all(stressProcess))()
