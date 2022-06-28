# Debugging

## Code in executeScript

- Set a debugger in the code to be executed in executeScript with the `debugger` keyword
- Set a debugger in the test with TestCafe’s debugger before the executeScript code runs (e.g., await t.debug() or await driver.debug() -- depending on the name of the TestController)
- Run test with a full browser (doesn’t work headlessly)
- Open the developer tools in the browser once the breakpoint is reached
- Resume the test using the TestCafe controls in the browser window (at the bottom of the window)
- Debugger set in #1 should be reached in the developer tools

## Code in SDK

- Set a debugger in the source code with the `debugger` keyword
- Run the test with the --inspect-brk flag
- Connect to the debugger using Chrome
- visit chrome://inspect/#devices
- Click the session listed under Remote Target
- Click the resume button in the developer tools once opened
- Debugger set in #1 should be reached in the developer tools

# Other versions

## BrowserStack TestCafe fork

As noted in the BrowserStack docs, to use some of their more advanced capabilities with TestCafe the user must install a fork of TestCafe (!) -- which as of this writing, is based off of 1.8.5-alpha.2 of TestCafe (whereas the current version of TestCafe is 1.9.3).

Relevant links:
  - https://www.browserstack.com/docs/automate/selenium/getting-started/nodejs/testcafe
  - https://github.com/browserstack/testcafe

# Known limitations

## Unable to traverse between frames

https://github.com/DevExpress/testcafe/issues/5429

### Has workaround? Yes

## Unable to capture screenshot on Safari when using CSS translate

https://github.com/DevExpress/testcafe/issues/4600

### Has workaround? No

## Unable to return mixed data-types from executeScript

Not a bug, just a design constraint of TestCafe.

### Has workaround? Yes

## Unable to use linking between internal packages

Due to implicit babeling that TestCafe does at runtime.

## Has workaround? Yes

