const fs = require('fs').promises;
const path = require('path');

const skipList = ['eyes-universal-poc', 'eyes-leanft', 'eyes-images-legacy', 'eyes-sdk-core-legacy', 'eyes-common-legacy', 'eyes-selenium-3'];

;(async () => {
    const items = await fs.readdir(path.join(__dirname, '../../'));
    const packages = items.filter(package => !skipList.includes(package) && !package.startsWith('.'));
    const packagesStr = packages
    .filter(package => !skipList.includes(package) && !package.startsWith('.'))
    .map(package => `  - package-ecosystem: "npm"
    directory: "/packages/${package}"
    schedule:
      interval: "daily"
    allowed_updates:
      - match:
        update_type: "security"`)
    .join('\n')
    const fileContent = `version: 2\nupdates:\n${packagesStr}`
    await fs.writeFile(path.join(__dirname,'../../../.github/dependabot.yml'), fileContent);
})()

