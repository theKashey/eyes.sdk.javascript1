import * as core from '@actions/core'
import * as path from 'path'
import * as fs from 'fs/promises'
import {execSync} from 'child_process'

const OS = {
  linux: 'ubuntu-latest',
  ubuntu: 'ubuntu-latest',
  mac: 'macos-latest',
  macos: 'macos-latest',
  win: 'windows-2022',
  windows: 'windows-2022',
}

const input = core.getInput('packages', {required: true})
const allowVariations = core.getBooleanInput('allow-variations')
const allowCascading = core.getBooleanInput('allow-cascading')
const onlyChanged = core.getBooleanInput('only-changed')
const defaultReleaseVersion = core.getInput('release-version')

core.notice(`Input provided: "${input}"`)

const packagesPath = path.resolve(process.cwd(), './packages')
const packageDirs = await fs.readdir(packagesPath)
const packages = await packageDirs.reduce(async (packages, packageDir) => {
  const packageManifestPath = path.resolve(packagesPath, packageDir, 'package.json')
  if (await fs.stat(packageManifestPath).catch(() => false)) {
    const manifest = JSON.parse(await fs.readFile(packageManifestPath, {encoding: 'utf8'}))
    const jobName = manifest.aliases?.[0] ?? packageDir
    packages = await packages
    packages[manifest.name] = {
      name: manifest.name,
      jobName,
      dirname: packageDir,
      aliases: manifest.aliases,
      framework: Object.keys(manifest.peerDependencies ?? {})[0],
      dependencies: [...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.devDependencies ?? {})]
    }
  }
  return packages
}, Promise.resolve({}))

Object.values(packages).forEach(packageInfo => {
  packageInfo.dependencies = packageInfo.dependencies.filter(depName => packages[depName])
})

let jobs = createJobs(input)

if (onlyChanged) {
  jobs = filterInsignificantJobs(jobs)
}

if (allowCascading) {
  const additionalJobs = createDependencyJobs(jobs)
  jobs = {...jobs, ...additionalJobs}
}

if (onlyChanged) {
  jobs = filterInsignificantJobs(jobs)
}

console.log(jobs)
core.notice(`Jobs created: "${Object.values(jobs).map(job => job.displayName).join(', ')}"`)
core.setOutput('packages', allowVariations ? Object.values(jobs) : jobs)

function createJobs(input) {
  return input.split(/[\s,]+/).reduce((jobs, input) => {
    let [_, packageKey,  releaseVersion, frameworkVersion, frameworkProtocol, nodeVersion, jobOS, shortReleaseVersion, shortFrameworkVersion, shortFrameworkProtocol]
      = input.match(/^(.*?)(?:\((?:version:(patch|minor|major);?)?(?:framework:([\d.]+);?)?(?:protocol:(.+?);?)?(?:node:([\d.]+);?)?(?:os:(linux|ubuntu|mac|macos|win|windows);?)?\))?(?::(patch|minor|major))?(?:@([\d.]+))?(?:\+(.+?))?$/i)
  
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
      version: releaseVersion,
      os: OS[jobOS ?? 'linux'],
      node: nodeVersion ?? 'lts/*',
      env: {
        [`APPLITOOLS_${packageInfo.jobName.toUpperCase()}_MAJOR_VERSION`]: frameworkVersion,
        [`APPLITOOLS_${packageInfo.jobName.toUpperCase()}_VERSION`]: frameworkVersion,
        [`APPLITOOLS_${packageInfo.jobName.toUpperCase()}_PROTOCOL`]: frameworkProtocol
      }
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
        // version: defaultReleaseVersion,
      }
    }
  }

  return dependencyJobs
}

function filterInsignificantJobs(jobs) {
  const filteredJobs = Object.entries(jobs).reduce((filteredJobs, [jobName, job]) => {
    let tag
    try { 
      tag = execSync(`git describe --tags --match "${job.packageName}@*" --abbrev=0`, {encoding: 'utf-8'})
    } catch {}
    if (tag) {
      const commits = execSync(`git log ${tag.trim()}..HEAD --oneline -- ${path.resolve(packagesPath, job.dirname)}`, {encoding: 'utf8'})
      if (!commits) return filteredJobs
    }
    filteredJobs[jobName] = job
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