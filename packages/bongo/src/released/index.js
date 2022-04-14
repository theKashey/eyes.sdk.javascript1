const {getSDKPackageNames} = require('../changelog')
const path = require('path')
const {findPackageVersionNumbers, getTagsWith} = require('../git')

async function released({args, pendingChangesFilePath}) {
  const {cwd, filterBySDK, packageName, sha, version, versionsBack} = args
  const pkgName = packageName ? packageName : require(path.join(cwd, 'package.json')).name
  const versions = await findPackageVersionNumbers({cwd, packageName})
  const tag = version ? `${pkgName}@${version}` : `${pkgName}@${versions[versionsBack]}`
  const filterByCollection = filterBySDK ? getSDKPackageNames(pendingChangesFilePath) : undefined
  const result = sha
    ? await getTagsWith({sha, filterByCollection})
    : await getTagsWith({tag, filterByCollection})
  console.log('bongo released output')
  if (!sha)
    console.log(
      'you can specify a different package version with either an explicit version (with --version or --v) or through a relative number (with --versionsBack or --n)',
    )
  console.log(`showing where ${sha ? sha : tag} has been released to`)
  console.log(result)
}

module.exports = released
