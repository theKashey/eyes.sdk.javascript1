module.exports = {
  apiKey: process.env.APPLITOOLS_API_KEY_SDK,
  saveNewTests: false,
  batch: {
    name: 'JS Coverage Tests - Cypress',
  },
  parentBranchName: 'master',
  branchName: 'master',
  testConcurrency: 100,
};
