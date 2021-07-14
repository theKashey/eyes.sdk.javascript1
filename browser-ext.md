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

The extension is released as a `.crx` file under GitHub releases: https://github.com/applitools/eyes.sdk.javascript1/releases
Download this file and double click it, or drag it into Google Chrome in order to install the extension.

// TODO gif

## Usage

The automation environment should communicate with the Eyes SDK browser extension by executing JavaScript on the automated browser window.

### API

Here is the JS methods that are exposed 

#### __applitools.openEyes

This function creates a visual test and returns the `Eyes` instance for creating visual checkpoints and for closing the test. It expects an input of the type [EyesManagerConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L19), with an additional property `config` of the type [EyesConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L25).

Returns: instance of `Eyes` which has `check` and `close` methods.

Example:

```js
// classic mode
const eyes = await __applitools.openEyes({
  config: {appName: 'My App', testName: 'My test', apiKey: '<your API key>'}
})

// Ultra fast grid mode
const eyes = await __applitools.openEyes({
  type: 'vg',
  concurrency: 10,
  config: {appName: 'My App', testName: 'My test', apiKey: '<your API key>'}
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
await driver.exectueScript(`return __applitools.openEyes({
  type: 'vg',
  concurrency: 10,
  config: {appName: 'My App', testName: 'My test', apiKey: '<your API key>'}
})`)

await driver.exectueScript(`return __applitools.eyes.check({})`)

await driver.exectueScript(`return __applitools.eyes.close()`)
```

### Script timeout and polling

TBD

## Tosca user API

As an automation environment using the Eyes SDK browser extension, Tosca should expose to the end user the relevant configuration, and transform the user input into the input for the Eyes browser extension.

The various configuration types that should be passed are the following (these will be described in further detail when we add the API details to this document):

- [EyesConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L25)
- [EyesManagerConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L19)
- [CheckSettings](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/setting.ts#L66)

In addition, the test result data returned from the Eyes browser extension should be surfaced to the user. This data is of the following type:

- [TestResult](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/data.ts#L205)
