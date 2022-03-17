#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const {exec} = require('child_process')
const {promisify} = require('util')
const pexec = promisify(exec)

async function runCommandInAllPackages(command) {
  const pkgPaths = fs.readdirSync('./packages', {withFileTypes: true})
    .filter(entry => entry.isDirectory())
    .map(entry => path.resolve(process.cwd(), 'packages', entry.name))
  for (const pkgPath of pkgPaths) {
    try {
      console.log(pkgPath)
      const {stdout} = await pexec(`cd ${pkgPath} && ${command}`)
      console.log(stdout)
    } catch (error) {
      console.log(error)
      // onto the next one
    }
  }
}

if (require.main === module) {
  if (!process.argv[2]) throw new Error('no command provided')
  runCommandInAllPackages(process.argv[2])
}

module.exports = runCommandInAllPackages
