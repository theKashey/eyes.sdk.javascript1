const fs = require('fs').promises
const path = require('path')

const skipList = [
  'eyes-universal-poc',
  'eyes-leanft',
  'eyes-images-legacy',
  'eyes-sdk-core-legacy',
  'eyes-common-legacy',
  'eyes-selenium-3',
]

;(async () => {
  const items = await fs.readdir(path.join(__dirname, '../../'))
  const packages = items.filter(packageName => !skipList.includes(packageName) && !packageName.startsWith('.'))
  const packagesStr = packages
    .filter(packageName => !skipList.includes(packageName) && !packageName.startsWith('.'))
    .map(
      packageName => `  - package_manager: "javascript"
    directory: "/packages/${packageName}"
    update_schedule: "live"
    allowed_updates:
      - match:
          update_type: "security"`,
    )
    .join('\n')
  const fileContent = `version: 1\nupdate_configs:\n${packagesStr}`
  await fs.writeFile(path.join(__dirname, '../../../.github/dependabot.yml'), fileContent)
})()
