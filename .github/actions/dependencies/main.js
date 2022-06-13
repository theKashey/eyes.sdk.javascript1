import * as core from '@actions/core'
import * as path from 'path'
import * as fs from 'fs/promises'
import YAML from 'yaml'

const cwd = process.cwd()
const workflowFilePath = path.resolve(cwd, './.github/workflows/publish-new.yml')
const packagesPath = path.resolve(cwd, './packages')

const workflow = YAML.parseDocument(await fs.readFile(workflowFilePath, {encoding: 'utf8'}))

const packageDirs = await fs.readdir(packagesPath)
const packages = await packageDirs.reduce(async (packages, packageDir) => {
  const packageManifestPath = path.resolve(packagesPath, packageDir, 'package.json')
  if (await fs.stat(packageManifestPath).catch(() => false)) {
    const manifest = JSON.parse(await fs.readFile(packageManifestPath, {encoding: 'utf8'}))
    manifest.aliases ??= [packageDir]
    const [jobName] = manifest.aliases
    if (workflow.hasIn(['jobs', jobName])) {
      packages = await packages
      packages[manifest.name] = manifest
    } else {
      core.warning(`There is no job for package "${manifest.name}"`)
    }
  }
  return packages
}, Promise.resolve({}))

const dependencies = Object.values(packages).reduce((dependencies, manifest) => {
  const [jobName] = manifest.aliases
  dependencies[jobName] = {
    deps: Object.keys(manifest.dependencies ?? {}).reduce((deps, depName) => packages[depName] ? deps.concat(packages[depName].aliases[0]) : deps, []),
    devDeps: Object.keys(manifest.devDependencies ?? {}).reduce((deps, depName) => packages[depName] ? deps.concat(packages[depName].aliases[0]) : deps, []),
  }
  return dependencies
}, {})

for (const [jobName, {deps, devDeps}] of Object.entries(dependencies)) {
  console.log(jobName, {deps, devDeps})
  const needs = [
    'setup',
    ...deps,
    ...devDeps.filter(depName => !dependencies[depName].deps.includes(jobName))
  ]
  workflow.setIn(['jobs', jobName, 'needs'], workflow.createNode(needs, {flow: true}))
}

await fs.writeFile(workflowFilePath, YAML.stringify(workflow))