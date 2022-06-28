const path = require('path')

function amendPackagesList(packages, {ignoreLegacy = true} = {}) {
  const pkgNames = packages.map(pkg => pkg.name)
  const pkgs = packages
    .map(pkg => {
      if (!pkg.dependencies) {
        const {dependencies = {}, devDependencies = {}} = require(path.join(
          pkg.path,
          'package.json',
        ))
        const internalDeps = Object.entries(dependencies).filter(
          ([depName, _depVersion]) => pkg.name !== depName && pkgNames.includes(depName),
        )
        const internalDevDeps = Object.entries(devDependencies).filter(
          ([depName, _depVersion]) => pkg.name !== depName && pkgNames.includes(depName),
        )
        pkg.dependencies = Object.fromEntries(internalDeps)
        pkg.devDependencies = Object.fromEntries(internalDevDeps)
      }
      return pkg
    })
    .map(pkg => {
      pkg.dependent_of = packages
        .filter(p => Object.keys(p.dependencies).includes(pkg.name))
        .map(p => p && p.name)
      pkg.dev_dependent_of = packages
        .filter(p => p.devDependencies && Object.keys(p.devDependencies).includes(pkg.name))
        .map(p => p && p.name)
      return pkg
    })
  if (ignoreLegacy)
    return pkgs.filter(
      pkg =>
        !pkg.name.includes('legacy') &&
        !pkg.path.includes('legacy') &&
        !pkg.name.startsWith('eyes.') &&
        !pkg.name.includes('eyes.'),
    )
  return pkgs
}

function makeDependencyTree(packages = [], {ignoreLegacy} = {}) {
  let pkgs = amendPackagesList(packages, {ignoreLegacy})

  function findBranches(pkgs, chunk, results = []) {
    if (!pkgs.length) return results
    let branchDeps, branchDepNames
    if (!chunk) {
      branchDeps = pkgs.filter(pkg => !pkg.dependent_of.length) // a.k.a. tip of tree
      branchDepNames = branchDeps.map(pkg => pkg.name)
    } else {
      const chunkDeps = [...new Set(chunk.map(pkg => Object.keys(pkg.dependencies)).flat())]
      branchDepNames = chunkDeps.filter(pkgName => {
        const pkg = pkgs.find(pkg => pkg.name === pkgName)
        if (!pkg) return
        return !pkg.dependent_of.some(dep_of => chunkDeps.includes(dep_of))
      })
      branchDeps = branchDepNames.map(depName => pkgs.find(pkg => pkg.name === depName))
    }
    if (!branchDeps.length) {
      console.error(
        "A problem's occurred. You might have one or more ciruclar references, returning what's been found so far",
      )
      return results
    }
    results.unshift(branchDepNames)
    branchDepNames.forEach(name => {
      pkgs = pkgs.filter(pkg => pkg.name !== name)
    })
    return findBranches(pkgs, branchDeps, results)
  }

  const tree = findBranches(pkgs)
  const misclassifiedDevDependencies = tree[tree.length - 1].filter(pkgName => {
    const pkg = pkgs.find(p => p.name === pkgName)
    return pkg.dev_dependent_of.length
  })
  if (misclassifiedDevDependencies.length) {
    tree[tree.length - 1] = tree[tree.length - 1].filter(pkgName => {
      const pkg = pkgs.find(p => p.name === pkgName)
      return !pkg.dev_dependent_of.length
    })
    misclassifiedDevDependencies.forEach(depName => {
      const pkg = pkgs.find(p => p.name === depName)
      const indicesInTreeWhereUsed = pkg.dev_dependent_of
        .map(p => tree.findIndex(branch => branch.includes(p)))
        .filter(index => index >= 0)
      const lowestTreeIndexWhereUsed = Math.min(...indicesInTreeWhereUsed)
      if (lowestTreeIndexWhereUsed === 0) tree.unshift([depName])
      else tree[lowestTreeIndexWhereUsed - 1] = tree[lowestTreeIndexWhereUsed - 1].concat([depName])
    })
  }
  return {tree, packages: pkgs}
}

function filterDependencyTreeByPackageName(packageName, {packages, tree, withDevDeps}) {
  const targetBranchIndex = tree.findIndex(branch => branch.includes(packageName))
  const endOfTreeIndex = tree.length
  const treeSegment = tree.slice(targetBranchIndex, endOfTreeIndex)

  function unrollDeps({packageName, packages}) {
    const pkg = packages.find(pkg => pkg.name === packageName)
    packages = packages.filter(pkg => pkg.name !== packageName)
    if (!pkg) return
    const pkgDeps = withDevDeps
      ? [...pkg.dev_dependent_of, ...pkg.dependent_of]
      : [...pkg.dependent_of]
    if (pkgDeps.length) {
      let results = [packageName, ...pkgDeps]
      pkgDeps.forEach(depName => {
        const result = unrollDeps({packageName: depName, packages})
        if (result && result.length) results = results.concat(result)
      })
      return results
    }
  }

  const targetPackages = [...new Set(unrollDeps({packageName, packages}))]

  return treeSegment.map(branch => branch.filter(pkgName => targetPackages.includes(pkgName)))
}

module.exports = {
  makeDependencyTree,
  filterDependencyTreeByPackageName,
}
