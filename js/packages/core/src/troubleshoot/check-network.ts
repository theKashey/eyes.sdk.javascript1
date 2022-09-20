import chalk from 'chalk'
import {ptimeoutWithError, presult} from './utils'
import defaultEyes from './eyes'
import defaultUFG from './ufg'
import * as utils from '@applitools/utils'

const TIMEOUT = 15000

const config = utils.config.getConfig({params: ['apiKey', 'serverUrl', 'proxy']})

export async function checkNetwork({stream = process.stdout, eyes = defaultEyes, ufg = defaultUFG} = {}) {
  const hasClearLine = stream.clearLine && stream.cursorTo

  async function doTest(func, name) {
    const delimiterLength = 30 - name.length
    const delimiter = new Array(delimiterLength).join(' ')
    hasClearLine && printSuccess(name, delimiter, '[ ?  ]')

    const start = Date.now()
    const funcWithTimeout = ptimeoutWithError(func(), TIMEOUT, new Error('request timeout!'))
    const [err] = await presult(funcWithTimeout)
    const end = (Date.now() - start) / 1000

    clearLine()
    if (err) {
      printErr(name, delimiter, `[ X  ]  +${end}`, err.message, err.message[err.message.length - 1] !== '\n' ? '\n' : '')
    } else {
      printSuccess(name, delimiter, `[ OK ]  +${end}`, '\n')
    }
    return !!err
  }

  function print(...msg) {
    stream.write(chalk(...msg))
  }

  function printErr(...msg) {
    stream.write(chalk.red(...msg))
  }

  function printSuccess(...msg) {
    stream.write(chalk.green(...msg))
  }

  function clearLine() {
    if (hasClearLine) {
      stream.clearLine(0)
      stream.cursorTo(0)
    }
  }

  if (!config.apiKey) {
    printErr('Missing "apiKey". Add APPLITOOLS_API_KEY as an env variable or add "apiKey" in applitools.config.js\n')
    return
  }
  const proxyEnvMsg = `HTTP_PROXY="${process.env.HTTP_PROXY || ''}"\nHTTPS_PROXY="${process.env.HTTPS_PROXY || ''}"`
  const configMsg = `User config: ${JSON.stringify(config, null, 2)}\n${proxyEnvMsg}`
  print(`Eyes Check Network. Running with:\n\n---\n\n${chalk.cyan(configMsg)}\n\n---\n\n`)

  let hasErr = false
  let curlRenderErr = true
  let curlVgErr = true

  // TODO - http and fetch need to account for proxy.

  print('[1] Checking eyes API', eyes.url.origin, '\n')
  curlRenderErr = await doTest(eyes.testCurl, '[eyes] cURL')
  hasErr = curlRenderErr
  hasErr = (await doTest(eyes.testHttps, '[eyes] https')) || hasErr
  hasErr = (await doTest(eyes.testFetch, '[eyes] node-fetch')) || hasErr
  hasErr = await doTest(eyes.testServer, '[eyes] server connector')

  print('[2] Checking Ultrafast grid API', ufg.url.origin, '\n')
  curlVgErr = await doTest(ufg.testCurl, '[UFG] cURL')
  hasErr = curlVgErr || hasErr
  hasErr = (await doTest(ufg.testHttps, '[UFG] https')) || hasErr
  hasErr = (await doTest(ufg.testFetch, '[UFG] node-fetch')) || hasErr
  hasErr = (await doTest(ufg.testServer, '[UFG] server connector')) || hasErr

  if (!hasErr) {
    printSuccess('\nSuccess!\n')
  }

  const proxyMsg = '\nYour proxy seems to be blocking requests to Applitools. Please make sure the following command succeeds:'
  if (curlRenderErr) {
    printErr(proxyMsg, '\n', eyes.cmd, '\n')
  } else if (curlVgErr) {
    printErr(proxyMsg, '\n', await ufg.getCmd())
  }
}

checkNetwork()
