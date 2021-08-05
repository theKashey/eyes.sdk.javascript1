# Eyes SDK core

[![npm](https://img.shields.io/npm/v/@applitools/eyes-sdk-core.svg?style=for-the-badge)](https://www.npmjs.com/package/@applitools/eyes-sdk-core)

<center>

![Applitools Eyes](https://i.ibb.co/3hWJK68/applitools-eyes-logo.png)

</center>

This package contains the low level API for working with Applitools' JS SDK's.

## Usage


### API

#### makeSDK

Initializes the SDK with a name, version and implementation of a driver.

Parameters (passed as a single destructured object):

- `name` - name of the SDK (this will appear in Applitools reports as part of the `agentId`)
- `version` - version of the SDK
- `spec` - implementation of the [SpecDriver](https://github.com/applitools/eyes.sdk.javascript1/blob/dd4f511566873684ff0d8fec6266a065b01ba98d/packages/types/src/spec-driver.ts#L5)
- `VisualGridClient` - this is an implementation detail, and will be removed in a future version. For now, it's required to pass `require('@applitools/visual-grid-client`) in this property.


Returns an instance of the SDK, which can be used to create a [Manager](#sdk.makeManager).

For example:

```js
const {makeSDK} = require('@applitools/eyes-sdk-core')

const sdk = makeSDK({
    name: 'my.special.SDK',
    version: '1.2.3',
    spec,
    VisualGridClient: require('@applitools/visual-grid-client')
})
```

#### sdk.makeManager

Initializes a Manager instance. The Manager is responsible for creating multiple visual tests. A single manager should be created for an entire execution of test suites, in order to get benefits of caching and parallelism.

Parameters: [EyesManagerConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L19)

Returns: [EyesManager](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/core.ts#L23)

For example: 

```js
// creates a manager for Ultrafast Grid tests:
const manager = await sdk.makeManager({type: 'vg', concurrency: 10})

// creates a manager for classic tests:
const manager = await sdk.makeManager()
```

#### manager.openEyes

Creates a visual test and returns the Eyes interface for performing various visual operations that Applitools provides.

Parameters (passed as a single destructured object):

- `driver` - the driver which is used to automate the application under test. This will be fed to `SpecDriver` methods as the first paramters.
- `config` - configuration of type [EyesConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L25).

Returns: [Eyes](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/core.ts#L32)

For example:

```js
const eyes = await manager.openEyes({
    driver,
    config: {
        appName: 'My app',
        testName: 'My test',
        viewportSize: {width: 1000, height: 800},
        apiKey: '<Your API key>',
    }
})
```

#### manager.closeAllEyes

Closes all open tests, and waits for all of them to finish.

Parameters:

- `throwOnDiff` - boolean indicating whether to throw an exception if a visual difference is detected in one or more tests.

Returns: Array of [TestResults](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/data.ts#L205) (i.e. TestResults[]).

For example:

```js
const allTestResults = await manager.closeAllEyes()

for (const testResults of allTestResults) {
    console.log(`Test ${testResults.name}: ${testResults.status}`)
}
```

#### eyes.check

Creates a visual checkpoint.

Parameters (passed as a single destructured object):

- `settings` - [CheckSettings](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/setting.ts#L66)
- `config` - [EyesConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L25)

Returns: [MatchResult](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/data.ts#L200)

For example:

```js
// full page screenshot:
await eyes.check({
    settings: {fully: true}
})

// element screenshot:
await eyes.check({
    settings: {region: '.some-element'}
})
```

#### eyes.checkAndClose

Creates a visual checkpoint and closes the test.

Parameters (passed as a single destructured object):

- `settings` - [CheckSettings](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/setting.ts#L66)
- `config` - [EyesConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L25)
- `throwOnDiff` - boolean indicating whether to throw an exception if a visual difference is detected in one or more tests.

Returns: [TestResults](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/data.ts#L205)

For example:

```js
const testResults = await eyes.checkAndClose({settings, config})
```

#### eyes.close

Closes the visual test.

Parameters:

- `throwOnDiff` - boolean indicating whether to throw an exception if a visual difference is detected in one or more tests.

Returns: [TestResults](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/data.ts#L205)

For example:

```js
const testResults = await eyes.close()
```

#### eyes.abort

Aborts the visual test.

Parameters:

none

Returns: [TestResults](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/data.ts#L205)

For example:

```js
const testResults = await eyes.abort()
```
#### eyes.locate

Locate region of visual locator.

Parameters (passed as a single destructured object):

- `settings` - [LocateSettings](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/setting.ts#L92)
- `config` - [EyesConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L25)

Returns: object with keys that correspond to the `locatorNames` that were sent in `settings`, and with values of type [Region](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/data.ts#L59).

For example:

```js
// full page screenshot:
const regions = await eyes.locate({
    settings: {locatorNames: ['locator-a', 'locator-b']}
})

console.log(regions['locator-a']) // {x: 10, y: 20, width: 200, height: 80}
console.log(regions['locator-b']) // {x: 10, y: 20, width: 200, height: 80}
```

#### eyes.extractText

Extract text from region using OCR.

Parameters (passed as a single destructured object):

- `regions` - [OCRExtractSettings[]](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/setting.ts#L78)
- `config` - [EyesConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L25)

Returns: array of strings that correspond to the `regions` that were passed.

For example:

```js
// full page screenshot:
const texts = await eyes.extractText({
    regions: [
        {target: '.element-1'},
        {target: '.element-2'}
    ]
})

console.log(texts[0]) // text from .element-1
console.log(texts[1]) // text from .element-2
```

#### eyes.extractTextRegions

Extract regions that contain text patterns, using OCR.

Parameters (passed as a single destructured object):

- `settings` - [OCRSearchSettings[]](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/setting.ts#L85)
- `config` - [EyesConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L25)

Returns: object with keys that correspond to the `patterns` that were sent in `settings, and with values of types [TextRegion](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/data.ts#L61).

For example:

```js
// full page screenshot:
const regions = await eyes.extractTextRegions({
    settings: {
        patterns: ['abc', '\\d+']
    }
})

console.log(regions['abc']) // [{x, y, width, height, text: 'abc'}]
console.log(regions['\\d+']) // [{x, y, width, height, text: '1234'}, {x, y, width, height, text: '0541234567'}]
```

## Examples

### SpecDriver for browser extension

Reference implementation can be found [here](https://github.com/applitools/eyes.sdk.javascript1/blob/490e05fac867a0a0beb22003af2a7f5e58b3287b/packages/eyes-browser-extension/src/spec-driver.js).

### SpecDriver for Selenium

Reference implementation can be found [here](https://github.com/applitools/eyes.sdk.javascript1/blob/e90ce45bacf3a13b11b5ded4fb3900f75501066c/packages/eyes-selenium/src/spec-driver.ts).

### Using selenium-webdriver

```js
const {Builder} = require('selenium-webdriver')
const {makeSDK} = require('@applitools/eyes-sdk-core')
const spec = require('./spec-driver')

const config = {
    appName: 'My app',
    testName: 'My test',
    viewportSize: {width: 1000, height: 800},
    apiKey: '<Your API key>',
};

const sdk = makeSDK({
    name: 'my.special.SDK',
    version: '1.2.3',
    spec,
    VisualGridClient: require('@applitools/visual-grid-client')
})

;(async function main() {
    const driver = await new Builder().forBrowser('chrome').build()
    await driver.get('https://demo.applitools.com')
    const manager = await sdk.makeManager()
    const eyes = await manager.openEyes({driver, config})
    const testResults = await eyes.checkAndClose({settings: {fully: true}})
    console.log(testResults)
})()

```