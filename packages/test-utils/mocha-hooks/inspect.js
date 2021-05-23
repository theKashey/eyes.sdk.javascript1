const chalk = require('chalk')

exports.mochaHooks = {
  beforeAll() {
    if (!process.argv.includes('--list-only')) return

    const count = {pending: 0, resolved: 0}
    inspect(this.test.parent)
    console.log('\n')
    console.log(chalk.green(`Resolved: ${chalk.bold(count.resolved)}`))
    console.log(chalk.cyan(`Pending: ${chalk.bold(count.pending)}`))
    console.log(`Total: ${chalk.bold(count.resolved + count.pending)}`)

    process.exit(0)

    function inspect(entry, depth = -1) {
      const pending = isPending(entry)
      if (!entry.root) print(entry, {depth, pending})

      if (entry.type === 'test') {
        count[pending ? 'pending' : 'resolved'] += 1
      } else {
        entry.suites.forEach(suite => inspect(suite, depth + 1))
        entry.tests.forEach(test => inspect(test, depth + 1))
      }
    }

    function isPending(entry) {
      return entry.pending || (Boolean(entry.parent) && isPending(entry.parent))
    }

    function print(entry, {depth, pending}) {
      console.log(`${'  '.repeat(depth)}${pending ? chalk.cyan(`- ${entry.title}`) : entry.title}`)
    }
  },
}
