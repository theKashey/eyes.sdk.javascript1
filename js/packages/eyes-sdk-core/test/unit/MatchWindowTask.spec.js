const assert = require('assert')
const {makeLogger} = require('@applitools/logger')
const AppOutput = require('../../lib/match/AppOutput')
const MatchResult = require('../../lib/match/MatchResult')
const MatchWindowTask = require('../../lib/MatchWindowTask')

describe('MatchWindowTask', () => {
  let logger = makeLogger()

  it('should send ignoreMismatch', async () => {
    const matchAttempts = []
    const serverConnector = {
      matchWindow(_, data) {
        matchAttempts.push(data.toJSON())
        return new MatchResult(false)
      },
    }
    const getMatchData = () => ({
      appOutput: new AppOutput({
        screenshotUrl: '',
        domUrl: '',
        imageLocation: {x: 0, y: 0},
      }),
    })
    const runningSession = {}

    const task = new MatchWindowTask({getMatchData, serverConnector, runningSession, retryTimeout: 1, logger})

    await task.match({name: 'test', ignoreMismatch: false, shouldRunOnceOnTimeout: false, userInputs: []})

    const [firstMatchData, lastMatchData] = matchAttempts
    assert.strictEqual(firstMatchData.ignoreMismatch, true)
    assert.strictEqual(lastMatchData.ignoreMismatch, false)
  })
})
