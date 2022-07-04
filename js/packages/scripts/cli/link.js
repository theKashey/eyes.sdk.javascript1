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

async function link({
  linkPackages,
  packagePath = process.cwd(),
  packagesPath = path.resolve(packagePath, '..'),
  runInstall,
  runBuild,
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

  await Promise.all(
    linkPackages.map(async linkPackage => {
      console.log(`Preparing ${linkPackage.name} for linking`)
      const commands = ['yarn link']
      if (runInstall || runBuild) commands.push('yarn install', 'npm run upgrade:framework --if-present')
      return execAsync(commands.join(' && '), {cwd: path.resolve(packagesPath, linkPackage.dirname), encoding: 'utf8'})
    }),
  )

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
    await Promise.all(
      linkPackages.map(async linkPackage => {
        console.log(`Building ${linkPackage.name}`)
        return execAsync('npm run build --if-present', {
          cwd: path.resolve(packagesPath, linkPackage.dirname),
          encoding: 'utf8',
        })
      }),
    )
  }

  function execAsync(command, options) {
    return new Promise((resolve, reject) => {
      exec(command, options, (error, stdout, stderr) => {
        if (error) reject(error)
        resolve({stdout, stderr})
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
