function plural(tests) {
  return tests > 1 ? 's' : '';
}

module.exports = {
  Passed: {
    color: 'green',
    symbol: '\u2713',
    title: tests => `Passed - ${tests} test${plural(tests)}`,
  },
  Failed: {
    color: 'red',
    symbol: '\u2716',
    title: tests => `Errors - ${tests} test${plural(tests)}`,
  },
  Unresolved: {
    color: 'yellow',
    symbol: '\u0021',
    title: tests => `Diffs detected - ${tests} test${plural(tests)}`,
  },
  _New: {
    color: 'marine',
    symbol: '\u002b',
    title: tests => `New - ${tests} test${plural(tests)}`,
  }
};