const NUMBER_OF_TESTS = 5
const LARGE_STRING_LENGTH = 1024 * 1024 * 1
const payload = new Array(LARGE_STRING_LENGTH).join('a')
const stats = []

fixture`perf-lite`.after(() => {
  console.log('========= stats =========')
  stats.forEach(entry => console.log(entry))
  console.log('========================')
})
async function runTest(index, t) {
  const evalStart = Date.now()
  // eslint-disable-next-line
  await t.eval(() => console.log(payload), {dependencies: {payload}})
  const evalTotal = Date.now() - evalStart
  stats.push(`[test ${index}] ${evalTotal}ms for t.eval`)
}
for (let name in Array.from({length: NUMBER_OF_TESTS})) {
  test('blah', t => runTest(name, t))
}
