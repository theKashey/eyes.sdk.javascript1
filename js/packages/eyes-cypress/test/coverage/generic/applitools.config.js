const config = {
  saveNewTests: false,
  batch: {
    name: 'JS Coverage Tests - Cypress',
  },
  parentBranchName: 'master',
  branchName: 'master',
  testConcurrency: 100,
};

if (process.env.APPLITOOLS_API_KEY_SDK) {
  config.apiKey = process.env.APPLITOOLS_API_KEY_SDK;
}

module.exports = config;
