import * as core from '@actions/core'
import * as path from 'path'
import * as fs from 'fs/promises'
import YAML from 'yaml'
import INI from 'ini'

const cwd = process.cwd()
const workflowFilePath = path.resolve(cwd, './.github/workflows/publish.yml')
const jsPackagesPath = path.resolve(cwd, './js/packages')
const pyPackagesPath = path.resolve(cwd, './python')

const workflow = YAML.parseDocument(await fs.readFile(workflowFilePath, {encoding: 'utf8'}))

const dependencies = await getDependencies()

for (const [jobName, {deps = [], devDeps = []}] of Object.entries(dependencies)) {
  const needs = [
    'setup',
    ...deps,
    ...devDeps.filter(depName => !dependencies[depName].deps.includes(jobName))
  ]
  workflow.setIn(['jobs', jobName, 'needs'], workflow.createNode(needs, {flow: true}))
}

await fs.writeFile(workflowFilePath, YAML.stringify(workflow, {minContentWidth: 0, lineWidth: 0}))

async function getDependencies() {
  const jsPackageDirs = await fs.readdir(jsPackagesPath)
  const jsPackages = await jsPackageDirs.reduce(async (packages, packageDir) => {
    const packageManifestPath = path.resolve(jsPackagesPath, packageDir, 'package.json')
    if (!(await fs.stat(packageManifestPath).catch(() => false))) return packages

    const manifest = JSON.parse(await fs.readFile(packageManifestPath, {encoding: 'utf8'}))
    const [jobName] = manifest.aliases ?? [packageDir]
    if (workflow.hasIn(['jobs', jobName])) {
      packages = await packages
      packages[manifest.name] = {jobName, manifest}
    } else {
      core.warning(`There is no job for js package "${manifest.name}"`)
    }
    return packages
  }, Promise.resolve({}))
  const jsDependencies = Object.values(jsPackages).reduce((dependencies, {jobName, manifest}) => {
    dependencies[jobName] = {
      deps: Object.keys(manifest.dependencies ?? {}).reduce((deps, depName) => jsPackages[depName] ? deps.concat(jsPackages[depName].jobName) : deps, []),
      devDeps: Object.keys(manifest.devDependencies ?? {}).reduce((deps, depName) => jsPackages[depName] ? deps.concat(jsPackages[depName].jobName) : deps, []),
    }
    return dependencies
  }, {})

  const pyPackageDirs = await fs.readdir(pyPackagesPath)
  const pyPackages = await pyPackageDirs.reduce(async (packages, packageDir) => {
    const packageManifestPath = path.resolve(pyPackagesPath, packageDir, 'setup.cfg')
    if (!(await fs.stat(packageManifestPath).catch(() => false))) return packages

    const {iniString} = await fs.readFile(packageManifestPath, {encoding: 'utf8'}).then(iniString => {
      return iniString.split(/[\n\r]+/).reduce(({lastField, iniString}, line) => {
        const indent = line.slice(0, Array.from(line).findIndex(char => char !== ' ' && char !== '\t'))
        if (!lastField || indent.length <= lastField.indent.length) {
          const [key] = line.split(/\s?=/, 1)
          lastField = {key, indent}
          iniString += line + '\n'
        } else {
          iniString += lastField.indent + `${lastField.key}[]=` + line.trim() + '\n'
        }
        return {lastField, iniString}
      }, {lastField: null, iniString: ''})
    })
    const manifest = INI.parse(iniString)
    const packageName = manifest.metadata.name.replace('_', '-')
    const alias = packageName.replace('eyes-', '')
    const jobName = `python-${alias}`
    if (workflow.hasIn(['jobs', jobName])) {
      packages = await packages
      packages[packageName] = {jobName, manifest}
    } else {
      core.warning(`There is no job for python package "${manifest.metadata.name}"`)
    }
    return packages
  }, Promise.resolve({}))
  const pyDependencies = Object.values(pyPackages).reduce((dependencies, {jobName, manifest}) => {
    dependencies[jobName] = {
      deps: (manifest.options.install_requires ?? []).reduce((deps, depString) => {
        let [depName] = depString.split(/[<=>]/, 1)
        depName = depName.replace('_', '-')
        return pyPackages[depName] ? deps.concat(pyPackages[depName].jobName) : deps
      }, []),
    }
    return dependencies
  }, {})
  pyDependencies['python-universal'].deps.push('universal')

  return {...jsDependencies, ...pyDependencies}
}