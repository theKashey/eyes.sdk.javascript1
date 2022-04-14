const path = require('path')
const {findPackageVersionNumbers, gitLog, getPublishDate} = require('../git')

async function doListVersions({pkgName, versions, versionsBack}) {
  console.log(`Listing previous ${versionsBack} version numbers`)
  const versionsChunk = versions.slice(0, versionsBack)
  for (const version of versionsChunk) {
    const publishDate = await getPublishDate({tag: `${pkgName}@${version}`})
    console.log(`- ${version} (published ${publishDate})`)
  }
}

async function log(args) {
  const {
    cwd,
    expandAutoCommitLogEntries,
    listVersions,
    lowerVersion,
    packageName,
    splitByVersion,
    upperVersion,
    versionsBack,
  } = args

  const pkgName = packageName ? packageName : require(path.join(cwd, 'package.json')).name
  const versions = await findPackageVersionNumbers({cwd, packageName})
  const lower = lowerVersion || versions[versionsBack]
  const upper = upperVersion || versions[0]

  console.log('bongo log output')
  console.log(`package: ${pkgName}`)
  console.log(
    `Looking ${versionsBack} versions back (specify a different number to look back with --n)`,
  )
  if (versionsBack && lowerVersion)
    console.log(
      `arguments 'versionsBack' and 'lowerVersion' both provided, using 'lowerVersion' and ignoring 'versionsBack'`,
    )
  if (listVersions) {
    await doListVersions({pkgName, versions, versionsBack})
  } else {
    console.log(`changes from versions ${versions[versionsBack - 1]} to ${upper}`)
    if (splitByVersion) {
      const targetVersions = versions.slice(0, versionsBack + 1)
      for (let index = 0; index < targetVersions.length - 1; index++) {
        const output = await gitLog({
          packageName,
          cwd,
          lowerVersion: targetVersions[index + 1],
          upperVersion: targetVersions[index],
          expandAutoCommitLogEntries,
        })
        const publishDate = await getPublishDate({tag: `${pkgName}@${targetVersions[index]}`})
        console.log(targetVersions[index])
        console.log(publishDate)
        console.log(output)
      }
    } else {
      const output = await gitLog({
        packageName,
        cwd,
        lowerVersion: lower,
        upperVersion: upper,
        expandAutoCommitLogEntries,
      })
      const publishDate = await getPublishDate({tag: `${pkgName}@${upper}`})
      console.log(output)
      console.log(publishDate)
    }
  }
}

module.exports = log
