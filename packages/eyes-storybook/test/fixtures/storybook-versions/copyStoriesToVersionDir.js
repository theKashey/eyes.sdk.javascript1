const fs = require('fs');
const { exec } = require('child_process');
const { promisify: p } = require('util');
const pexec = p(exec);
const path = require('path');
let testsSupportedVersions = [];

// SB older versions (aka: 5.0.0 and former) expect to have 'config.js' as the config file,
// adding other files to older versions will cause a failure
// adding 'config.js' file to newer versions will also cause failure
// since each version has it's own configuration, we allow running only for those who were pre-configured (in 'testsSupportedVersions')
const getConfigFilesListByVersion = ver => {
  switch (ver) {
    case '4.1.18':
    case '5.0.0':
      return ['config.js'];
    default:
      return testsSupportedVersions.includes(ver) ? ['main.js', 'preview.js'] : [];
  }
};
exports.copyStoriesToVersionDir = async ({ storybookSourceDir, storybookVersion}) => {
  testsSupportedVersions = [];
  fs.readdirSync(__dirname).map(fileName => {
    const filePath = path.join(__dirname, fileName);
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
      testsSupportedVersions.push(fileName)
    }
  });
  const versionDir = path.resolve(__dirname, `./${storybookVersion}`);
  await pexec(`cp -r ${storybookSourceDir}/stories/. ${versionDir}/stories`);
  await pexec(`mkdir -p ${versionDir}/.storybook`);
  const filesByVersion = getConfigFilesListByVersion(storybookVersion);
  for (const fileName of filesByVersion) {
    pexec(`cp ${storybookSourceDir}/.storybook/${fileName} ${versionDir}/.storybook`);
  }
}