# Eyes SDK browser extension
<center>

  ![Applitools Eyes](https://i.ibb.co/3hWJK68/applitools-eyes-logo.png)

  </center>

The Applitools Eyes SDK can be executed from any general agent which can automate a browser, without prior determination of the specific automation technology (e.g. the "driver").
This is achieved by launching the browser with an installed Eyes SDK browser extension. Once the browser extension is running, it is possible for the automation agent to communicate with it, in order to perform any operation that Applitools SDK's support.

Being a browser extension means that this can be achieved only on browsers which support the WebExtension standard, namely Chrome, Firefox, Edge, and Safari.
At the moment, we support only Chrome.

The Eyes SDK browser extension supports both UFG and Classic modes of operation, with all features currently supported in standard JS SDK's, e.g. the JavaScript Selenium SDK.

## Limitations

Headless Chrome does not support browser extensions, therefore the Eyes SDK browser extension doesn't work when running Chrome in headless mode.

## Installation

![](https://i.imgur.com/dmsNNRB.gif)

1. Download the `.zip` file under GitHub releases: https://github.com/applitools/eyes.sdk.javascript1/releases/tag/%40applitools%2Feyes-browser-extension%400.2.0
2. Navigate to [chrome://extensions]() in your browser
3. Switch on **Developer mode** on the top right
4. Drag the zip file into the browser


## Usage

[Demo project](
https://jssdkstorage.blob.core.windows.net/resources/eyes-browser-extension-demo.zip)


The automation environment should communicate with the Eyes SDK browser extension by executing JavaScript on the automated browser window.

### API

Here are the JS methods that are exposed on the page's `window`: 

#### __applitools.openEyes

This function creates a visual test and returns the `Eyes` instance for creating visual checkpoints and for closing the test. It expects an input of the type [EyesManagerConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L19), with an additional property `config` of the type [EyesConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L25).

Returns: instance of `Eyes` which has `check` and `close` methods.

_NOTE: the return value is seldom used in real world scenarios, since it is potentially cleared on page navigation. Instead, use the `__applitools.eyes` property. See more information in the **__applitools.eyes property** section below._

Example:

```js
// classic mode
const eyes = await __applitools.openEyes({
  config: {
    appName: 'My App',
    testName: 'My test', 
    apiKey: '<your API key>'
  }
})

// Ultra fast grid mode
const eyes = await __applitools.openEyes({
  type: 'vg',
  concurrency: 10,
  config: {
    appName: 'My App',
    testName: 'My test', 
    apiKey: '<your API key>',
    browsersInfo: [
      {name: 'chrome', width: 800, height: 600},
      {name: 'chrome', width: 1600, height: 1200},
      {name: 'ie', width: 1600, height: 1200},
      {name: 'firefox', width: 1440, height: 900},
      {name: 'edgechromium', width: 1440, height: 900},
      {name: 'safari', width: 1440, height: 900}
    ]
  }
})
```

#### eyes.check

This function should be called for performing a visual checkpoint. It expects as input a JSON object with property `settings` of the type [CheckSettings](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/setting.ts#L66).

Example:

```js
// viewport screenshot
eyes.check({})

// full page screenshot
eyes.check({settings: {fully: true}})

// element screenshot
eyes.check({settings: {target: 'h1'}})

// region screenshot
eyes.check({settings: {target: {width: 200, height: 80, top: 20, left: 10}}})
```

#### eyes.close

This function should be called to close the Eyes session. It receives no input, and returns a JSON object of the type [TestResult](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/data.ts#L205).

Example:

```js
eyes.close()
```

#### __applitools.eyes property

Since `eyes` is returned from `__applitools.openEyes` in the context of the browser tab, page navigations will cause it to be cleaned up and there will be no reference to it.

For this case, it's possible to use the property `__applitools.eyes` to get to the last created `Eyes` instance.

Example:

```js
await __applitools.openEyes({config: {appName: 'My App', testName: 'My test', apiKey: '<your API key>'}})
await __applitools.eyes.check({})
await __applitools.eyes.close()

```

### Example

In JavaScript Selenium this would look similar to the following:

```js
await driver.exectueAsyncScript(`return __applitools.openEyes({
  type: 'vg',
  concurrency: 10,
  config: {appName: 'My App', testName: 'My test', apiKey: '<your API key>'}
}).then(arguments[arguments.length-1])`)

await driver.exectueAsyncScript(`return __applitools.eyes.check({}).then(arguments[arguments.length-1])`)

await driver.exectueAsyncScript(`return __applitools.eyes.close().then(arguments[arguments.length-1])`)
```

### Script timeout and polling

In the previous example, we relied on Selenium's ability to execute an **async** JS operation and wait for its promise to resolve. Note the `.then(arguments[arguments.length - 1])` in every call.
Since this is not always available, we can resort to polling on our own in order to wait for the operation to finish.

Here is a snippet in Node.js for executing the API with polling:

```js
const SAVE_RESULT = `.then(value => __applitools.result = {status: 'SUCCESS', value}).catch(error => __applitools.result = {status: 'ERROR', error})`
const POLL_RESULT = `
let response = __applitools.result;
delete __applitools.result;
return response;
`

async function openEyes(config) {
  await driver.executeScript(`__applitools.openEyes({config: arguments[0]})${SAVE_RESULT}`, config)
  return pollResult()
}

async function check(settings) {
  await driver.executeScript(`__applitools.eyes.check({settings: arguments[0]})${SAVE_RESULT}`, settings)
  return pollResult()
}

async function close() {
  await driver.executeScript(`__applitools.eyes.close()${SAVE_RESULT}`)
  return pollResult()
}

async function pollResult() {
  let pollResponse
  while (!pollResponse) {
    pollResponse = await driver.executeScript(POLL_RESULT)
    await wait(100)
  }

  if (pollResponse.status === 'SUCCESS') {
    return pollResponse.value
  } else if (pollResponse.status === 'ERROR') {
    throw new Error(pollResponse.error)
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

## Resources

[Demo project](
https://jssdkstorage.blob.core.windows.net/resources/eyes-browser-extension-demo.zip)

Diagram:

![Diagram](https://jssdkstorage.blob.core.windows.net/resources/eyes-browser-extension2.png)
