import * as core from '@actions/core'
import * as github from '@actions/github'
import * as path from 'path'
import * as fs from 'fs/promises'
import {execSync} from 'child_process'
import INI from 'ini'

const TOOL_PACKAGES = [
  '@applitools/bongo',
  '@applitools/scripts',
  '@applitools/sdk-coverage-tests',
  '@applitools/api-extractor',
  '@applitools/sdk-fake-eyes-server',
  '@applitools/sdk-shared'
]

const OS = {
  linux: 'ubuntu-latest',
  ubuntu: 'ubuntu-latest',
  mac: 'macos-latest',
  macos: 'macos-latest',
  win: 'windows-2022',
  windows: 'windows-2022',
}

const allowVariations = core.getBooleanInput('allow-variations')
const allowCascading = core.getBooleanInput('allow-cascading')
const onlyChanged = core.getBooleanInput('only-changed')
const defaultReleaseVersion = core.getInput('release-version')

let input
if (github.context.eventName === 'workflow_dispatch') {
  input = core.getInput('packages', {required: true}) 
  core.notice(`Input provided: "${input}"`)
} else {
  input = changedInCurrentBranch()
  core.notice(`Packages with changes: "${input}"`)
}

const packages = await getPackages()

let jobs = createJobs(input)

core.info(`Requested jobs: "${Object.values(jobs).map(job => job.displayName).join(', ')}"`)

if (allowCascading) {
  const additionalJobs = createDependencyJobs(jobs)
  jobs = {...jobs, ...additionalJobs}
  core.info(`Requested and dependant jobs: "${Object.values(jobs).map(job => job.displayName).join(', ')}"`)
}

if (onlyChanged) {
  jobs = filterInsignificantJobs(jobs)
  core.info(`Filtered jobs: "${Object.values(jobs).map(job => job.displayName).join(', ')}"`)
}

core.notice(`Jobs created: "${Object.values(jobs).map(job => job.displayName).join(', ')}"`)
core.setOutput('packages', allowVariations ? Object.values(jobs) : jobs)

async function getPackages() {
  const jsPackagesPath = path.resolve(process.cwd(), './js/packages')
  const jsPackageDirs = await fs.readdir(jsPackagesPath)
  const jsPackages = await jsPackageDirs.reduce(async (packages, packageDir) => {
    const packagePath = path.resolve(jsPackagesPath, packageDir)
    const packageManifestPath = path.resolve(packagePath, 'package.json')
    if (!(await fs.stat(packageManifestPath).catch(() => false))) return packages

    const manifest = JSON.parse(await fs.readFile(packageManifestPath, {encoding: 'utf8'}))
    if (TOOL_PACKAGES.includes(manifest.name)) return packages
    packages = await packages
    packages[manifest.name] = {
      name: manifest.name,
      jobName: manifest.aliases?.[0] ?? packageDir,
      aliases: manifest.aliases,
      dirname: packageDir,
      path: packagePath,
      tag: `${manifest.name}@`,
      framework: Object.keys(manifest.peerDependencies ?? {})[0],
      dependencies: [...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.devDependencies ?? {})]
    }
    return packages
  }, Promise.resolve({}))

  Object.values(jsPackages).forEach(packageInfo => {
    packageInfo.dependencies = packageInfo.dependencies.filter(depName => jsPackages[depName])
  })

  const pyPackagesPath = path.resolve(process.cwd(), './python')
  const pyPackageDirs = await fs.readdir(pyPackagesPath)
  const pyPackages = await pyPackageDirs.reduce(async (packages, packageDir) => {
    const packagePath = path.resolve(pyPackagesPath, packageDir)
    const packageManifestPath = path.resolve(packagePath, 'setup.cfg')
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

    packages = await packages
    const alias = packageName.replace('eyes-', '')
    packages[packageName] = {
      name: packageName,
      jobName: `python-${alias}`,
      aliases: [`py-${alias}`, `python-${alias}`],
      dirname: packageDir,
      path: packagePath,
      tag: `@applitools/python/${packageDir}@`,
      // framework: null,
      dependencies: manifest.options.install_requires?.map(depString => {
        const [depName] = depString.split(/[<=>]/, 1)
        return depName
      }) ?? []
    }
    return packages
  }, Promise.resolve({}))

  Object.values(pyPackages).forEach(packageInfo => {
    packageInfo.dependencies = packageInfo.dependencies.filter(depName => pyPackages[depName])
  })

  pyPackages['eyes-universal'].dependencies.push('@applitools/eyes-universal')

  return {...pyPackages, ...jsPackages}
}

function createJobs(input) {
  return input.split(/[\s,]+(?=(?:[^()]*\([^())]*\))*[^()]*$)/).reduce((jobs, input) => {
    let [_, packageKey,  releaseVersion, frameworkVersion, frameworkProtocol, nodeVersion, jobOS, linkPackages, shortReleaseVersion, shortFrameworkVersion, shortFrameworkProtocol]
      = input.match(/^(.*?)(?:\((?:version:(patch|minor|major);?)?(?:framework:([\d.]+);?)?(?:protocol:(.+?);?)?(?:node:([\d.]+);?)?(?:os:(linux|ubuntu|mac|macos|win|windows);?)?(?:links:(.+?);?)?\))?(?::(patch|minor|major))?(?:@([\d.]+))?(?:\+(.+?))?$/i)
  
    releaseVersion ??= shortReleaseVersion ?? defaultReleaseVersion
    frameworkVersion ??= shortFrameworkVersion
    frameworkProtocol ??= shortFrameworkProtocol

    const packageInfo = Object.values(packages).find(({name, jobName, dirname, aliases}) => {
      return name === packageKey || jobName === packageKey || dirname === packageKey || aliases?.includes(packageKey)
    })
  
    if (!packageInfo) {
      core.warning(`Package name is unknown! Package configured as "${input}" will be ignored!`)
      return jobs
    }
  
    if (frameworkVersion || frameworkProtocol) {
      if (!allowVariations) {
        core.warning(`Modifiers are not allowed! Package "${packageInfo.name}" configured as "${input}" will be ignored!`)
        return jobs
      } else if (!packageInfo.framework) {
        core.warning(`Framework modifiers are not allowed for package "${packageInfo.name}"! Package configured as "${input}" will be ignored!`)
        return jobs
      }
    }
  
    const appendix = Object.entries({release: releaseVersion, version: frameworkVersion, protocol: frameworkProtocol, node: nodeVersion, os: jobOS})
      .reduce((parts, [key, value]) => value ? [...parts, `${key}: ${value}`] : parts, [])
      .join('; ')
  
    const job = {
      displayName: `${packageInfo.jobName}${appendix ? ` (${appendix})` : ''}`,
      packageName: packageInfo.name,
      name: packageInfo.jobName,
      dirname: packageInfo.dirname,
      path: packageInfo.path,
      tag: packageInfo.tag,
      version: releaseVersion,
      os: OS[jobOS ?? 'linux'],
      node: nodeVersion ?? 'lts/*',
      links: linkPackages,
      env: {
        [`APPLITOOLS_${packageInfo.jobName.toUpperCase()}_MAJOR_VERSION`]: frameworkVersion,
        [`APPLITOOLS_${packageInfo.jobName.toUpperCase()}_VERSION`]: frameworkVersion,
        [`APPLITOOLS_${packageInfo.jobName.toUpperCase()}_PROTOCOL`]: frameworkProtocol
      },
      requested: true
    }
  
    jobs[allowVariations ? job.displayName : job.name] = job
  
    return jobs
  }, {})
}

function createDependencyJobs(jobs) {
  const packageNames = Object.values(jobs).map(job => job.packageName)
  const dependencyJobs = {}

  for (const packageName of packageNames) {
    for (const dependencyName of packages[packageName].dependencies) {
      if (packageNames.includes(dependencyName)) continue
      packageNames.push(dependencyName)
      dependencyJobs[packages[dependencyName].jobName] = {
        displayName: packages[dependencyName].jobName,
        packageName: packages[dependencyName].name,
        name: packages[dependencyName].jobName,
        dirname: packages[dependencyName].dirname,
      }
    }
  }

  return dependencyJobs
}

function filterInsignificantJobs(jobs) {
  const filteredJobs = Object.entries(jobs).reduce((filteredJobs, [jobName, job]) => {
    if (job.requested || changedSinceLastTag(job)) filteredJobs[jobName] = job
    return filteredJobs
  }, {})

  let more = true
  while (more) {
    more = false
    for (const [jobName, job] of Object.entries(jobs)) {
      if (filteredJobs[jobName]) continue
      if (packages[job.packageName].dependencies.some(packageName => Object.values(filteredJobs).some(job => job.packageName === packageName))) {
        more = true
        filteredJobs[jobName] = job
      }
    }
  }

  return filteredJobs
}

function changedSinceLastTag(job) {
  let tag
  try {
    tag = execSync(`git describe --tags --match "${job.tag}*" --abbrev=0`, {encoding: 'utf8'}).trim()
  } catch {}

  if (!tag) return true

  const commits = execSync(`git log ${tag}..HEAD --oneline -- ${job.path}`, {encoding: 'utf8'})
  return Boolean(commits)
}

function changedInCurrentBranch() {
  const changedFiles = execSync('git --no-pager diff --name-only origin/master', {encoding: 'utf8'})
  const changedPackageNames = changedFiles.split('\n').reduce((changedPackageNames, changedFile) => {
    const changedPackage = Object.values(packages).find(changedPackage => {
      const changedFilePath = path.resolve(process.cwd(), changedFile)
      return changedFilePath.startsWith(changedPackage.path)
    })
    if (changedPackage) changedPackageNames.add(changedPackage.jobName)
    return changedPackageNames
  }, new Set())
  const packageNames = Array.from(changedPackageNames.values())
  return packageNames.map(packageName => `${packageName}(links:${packageNames.join(',')})`).join(' ')
}
