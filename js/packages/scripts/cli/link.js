#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const {exec} = require('child_process')
const yargs = require('yargs')

yargs
  .command({
    command: '*  [link-packages]',
    builder: yargs =>
      yargs.options({
        linkPackages: {
          alias: ['include'],
          description: 'Package names to link',
          type: 'string',
          coerce: string => string.split(/[\s,]+/),
        },
        packagePath: {
          alias: ['package'],
          description: 'Path to the target package',
          type: 'string',
        },
        packagesPath: {
          alias: ['root'],
          description: 'Path to the root directory of the local packages',
          type: 'string',
        },
        runInstall: {
          alias: ['install'],
          description: 'Run `yarn install` before link package',
          type: 'boolean',
        },
        runBuild: {
          alias: ['build'],
          description: 'Run `yarn build` if needed before link package',
          type: 'boolean',
        },
        verbose: {
          alias: ['v'],
          description: 'Log verbose log',
          type: 'bollean',
        },
      }),
    handler: async args => {
      try {
        await link(args)
      } catch (err) {
        console.error(err)
        process.exit(1)
      }
    },
  })
  .wrap(yargs.terminalWidth()).argv

function sortDependencies(json) {
  // create an empty array for the return value
  const sortedDependencies = []
  // using Set to check if the package added to the arr
  const checkSet = new Set()
  // the recursive function to check add dependencies tree
  function innerSortDependencies(name, obj, dedupe = []) {
    // if there is dependencies run on each of them
    if (obj.dependencies) {
      Object.entries(obj.dependencies).map(([name, deps]) => innerSortDependencies(name, deps, dedupe))
    } else if (
      // check if the `name` is deduped
      json.dependencies[name] &&
      json.dependencies[name].dependencies &&
      // check if it's the dedpuped pacakge already been check
      !dedupe.some(pName => pName === name)
    ) {
      Object.entries(json.dependencies[name].dependencies).map(([depName, depDeps]) =>
        // recursively run on the dependencies packages
        innerSortDependencies(depName, depDeps, dedupe.concat(depName)),
      )
    }
    // if the name already added skip
    if (!checkSet.has(name)) {
      checkSet.add(name)
      sortedDependencies.push(name)
    }
  }
  // start the recursive function
  innerSortDependencies(json.name, json)

  // return the sorted array
  return sortedDependencies
}

async function link({
  linkPackages,
  packagePath = process.cwd(),
  packagesPath = path.resolve(packagePath, '..'),
  runInstall,
  runBuild,
  verbose = false,
} = {}) {
  const manifest = JSON.parse(fs.readFileSync(path.resolve(packagePath, 'package.json'), {encoding: 'utf8'}))
  const packages = getPackages(packagesPath)
  const targetPackage = packages[manifest.name]
  if (!targetPackage) throw new Error('Package not found!')

  if (linkPackages) {
    linkPackages = Object.values(packages)
      .filter(pkg => linkPackages.some(linkName => [pkg.name, pkg.dirname, ...pkg.aliases].includes(linkName)))
      .filter(pkg => targetPackage.name !== pkg.name)
      .filter(pkg => hasInDependencyTree(targetPackage, pkg.name))
  } else {
    linkPackages = getDependencyTree(targetPackage)
  }

  if (linkPackages.length === 0) {
    console.log('Nothing to link')
    return
  }

  // getting the package names
  const packagesName = await linkPackages.map(({name}) => `'${name}'`)

  // run `npm ls` to get the dependencies tree of the package base on the packagesName
  const {stdout: npmLsRaw} = await execAsync(`npm -s ls --json ${packagesName.join(' ')}`, {encoding: 'utf8'}).catch(
    ([error, stdout]) => {
      // there could error if there are link packages that
      // not suite with the version in the `package.json`
      if (verbose) {
        console.error(error)
      }
      return {
        stdout,
      }
    },
  )

  // parse the result to JSON
  const npmLsJSON = JSON.parse(npmLsRaw)

  // sort the dependencies tree
  linkPackages = sortDependencies(npmLsJSON)
    .map(name => linkPackages.find(obj => obj.name === name))
    .filter(Boolean)

  await linkPackages.reduce(async (promise, linkPackage) => {
    await promise
    console.log(`Preparing ${linkPackage.name} for linking`)
    const commands = ['yarn link']
    if (runInstall || runBuild) commands.push('yarn install', 'npm run upgrade:framework --if-present')
    return execAsync(commands.join(' && '), {cwd: path.resolve(packagesPath, linkPackage.dirname), encoding: 'utf8'})
  }, Promise.resolve())

  await Promise.all(
    [targetPackage, ...linkPackages].map(async targetPackage => {
      console.log(`Linking to ${targetPackage.name}`)
      const linkCommands = linkPackages.map(linkPackage => `yarn link ${linkPackage.name}`)
      return execAsync(linkCommands.join(' && '), {
        cwd: path.resolve(packagesPath, targetPackage.dirname),
        encoding: 'utf8',
      })
    }),
  )

  if (runBuild) {
    linkPackages.reduce(async (promise, linkPackage) => {
      await promise
      console.log(`Try to build ${linkPackage.name}`)
      return execAsync('npm run build --if-present', {
        cwd: path.resolve(packagesPath, linkPackage.dirname),
        encoding: 'utf8',
      })
    }, Promise.resolve())
  }

  function execAsync(command, options) {
    return new Promise((resolve, reject) => {
      const cmd = exec(command, options, (error, stdout, stderr) => {
        if (error) reject([error, stdout])
        resolve({stdout, stderr})
      })
      if (verbose)
        cmd.stdout.on('data', data => {
          console.log(data)
        })
    })
  }

  function hasInDependencyTree(targetPackage, dependencyName) {
    const checkedPackages = new Set()

    return hasInDependencyTree(targetPackage, dependencyName)

    function hasInDependencyTree(targetPackage, dependencyName) {
      if (checkedPackages.has(targetPackage.name)) return false
      checkedPackages.add(targetPackage.name)
      if (targetPackage.dependencies.includes(dependencyName)) return true
      return targetPackage.dependencies.some(targetDependencyName => {
        const dependency = packages[targetDependencyName]
        return dependency && hasInDependencyTree(dependency, dependencyName)
      })
    }
  }

  function getDependencyTree(targetPackage) {
    const dependencies = {}
    getDependencyTree(targetPackage.dependencies)

    return Object.values(dependencies)

    function getDependencyTree(dependencyNames) {
      dependencyNames.forEach(dependencyName => {
        const dependency = packages[dependencyName]
        if (!dependency || dependencies[dependencyName]) return
        dependencies[dependencyName] = dependency
        getDependencyTree(dependency.dependencies)
      })
    }
  }
}

function getPackages(packagesPath) {
  const packageDirs = fs.readdirSync(packagesPath)
  return packageDirs.reduce((packages, packageDir) => {
    const packageManifestPath = path.resolve(packagesPath, packageDir, 'package.json')
    if (fs.existsSync(packageManifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(packageManifestPath, {encoding: 'utf8'}))
      packages[manifest.name] = {
        name: manifest.name,
        dirname: packageDir,
        aliases: manifest.aliases || [],
        dependencies: [...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.devDependencies ?? {})],
      }
    }
    return packages
  }, {})
}
