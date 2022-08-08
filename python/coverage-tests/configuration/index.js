let ref = "328f1720466";
let report_package_name = {
    'eyes_robotframework': 'eyes_robotframework',
    'eyes_selenium': 'eyes_selenium_python',
}
module.exports = {
    name: report_package_name[process.env.RELEASING_PACKAGE] || 'eyes_selenium_python',
    emitter: `https://raw.githubusercontent.com/applitools/sdk.coverage.tests/${ref}/python/emitter.js`,
    overrides: [
        `https://raw.githubusercontent.com/applitools/sdk.coverage.tests/${ref}/js/overrides.js`,
        `https://raw.githubusercontent.com/applitools/sdk.coverage.tests/${ref}/python/overrides.js`,
    ],
    template: `https://raw.githubusercontent.com/applitools/sdk.coverage.tests/${ref}/python/template.hbs`,
    tests: `https://raw.githubusercontent.com/applitools/sdk.coverage.tests/${ref}/coverage-tests.js`,
    ext: '.py',
    outPath: './test/coverage/generic',
}
