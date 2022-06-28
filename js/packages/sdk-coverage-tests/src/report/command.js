const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const {configLoader} = require('../loaders/config-loader')
const {createReport} = require('./create')
const {sendReport} = require('./send')
const uploadToStorage = require('./upload')

const DEFAULT_CONFIG = {
  metaDir: '',
  resultDir: '',
}

async function report(options) {
  const config = {
    ...DEFAULT_CONFIG,
    ...configLoader(options),
    ...options,
  }
  const cwd = process.cwd()
  const junit = fs.readFileSync(path.resolve(cwd, config.resultDir, 'coverage-test-report.xml'), {
    encoding: 'utf-8',
  })
  const metadata = require(path.resolve(cwd, config.metaDir, 'coverage-tests-metadata.json'))

  const report = createReport({
    reportId: config.reportId,
    name: config.name,
    sandbox: config.sandbox,
    junit,
    metadata,
  })

  console.log('Report was successfully generated!\n')
  if (report.id) {
    console.log(`${chalk.bold('Report ID')}: ${report.id}\n`)
  }

  const total = report.results.length
  const {passed, failed, skipped, generic, custom} = report.results.reduce(
    (counts, result) => {
      if (result.isGeneric) counts.generic += 1
      else counts.custom += 1
      if (result.isSkipped) counts.skipped += 1
      else if (result.passed) counts.passed += 1
      else counts.failed += 1

      return counts
    },
    {passed: 0, failed: 0, skipped: 0, generic: 0, custom: 0},
  )

  console.log(
    `${chalk.bold(`${total}`.padEnd(3))} total including ${chalk.blue.bold(
      `${generic} generic`,
    )} and ${chalk.magenta.bold(`${custom} custom`)} test(s)`,
  )
  console.log(chalk.green(`${chalk.bold(`${passed}`.padEnd(3))} passed test(s)`))
  console.log(chalk.cyan(`${chalk.bold(`${skipped}`.padEnd(3))} skipped test(s)`))
  console.log(chalk.red(`${chalk.bold(`${failed}`.padEnd(3))} failed test(s)`))

  process.stdout.write(`\nSending report to QA dashboard ${config.sandbox ? '(sandbox)' : ''}... `)
  const result = await sendReport(report)
  process.stdout.write(result.isSuccessful ? chalk.green('Done!\n') : chalk.red('Failed!\n'))
  if (!result.isSuccessful) {
    console.log(result.message)
  }
  await uploadToStorage({
    sdkName: config.name,
    reportId: config.reportId,
    isSandbox: config.sandbox,
    payload: JSON.stringify(report),
  }).catch(err => {
    console.log(chalk.gray('Error uploading results to Azure:', err.message))
  })
}

module.exports = report
