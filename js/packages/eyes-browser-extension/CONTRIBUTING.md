## Architecture

The goal: provide a way for test automation tools without the concept of a "driver" object to work with Eyes.

With a browser extension we can expose a set of Eyes commands (e.g., open, check, close) in the application under test (AUT) which can be invoked with a JavaScript executor in a given browser automation tool, and store/retrieve any state as needed.

For security purposes, browser extensions have layers to them -- and we end up using all of them in this extension.

First, there's the AUT. With browser extensions we can load a JavaScript file into any page (this is how we expose commands to the user -- a.k.a. pageScripts). Aside from exposing an interface here, we also perform JS evaluation here as part of the SDK spec that we implement in the background script. This enables unfettered access to the page with dom-snapshot.

Next, there's the content script. There's a lot that can be said about content scripts which has been better said [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts). Basically, in a content script we have access to the page (albeit limited) and we can communicate with the background script. We largely use the content script as a communication bus between the page scripts we inject into the AUT and the background script.

And lastly, there's the background script. This is where the business logic lives. We put it here since the background script can maintain state across the lifecycle of the browser (e.g., across page navigations).

Ultimately, this boils down to an outside-in, ping-pong style architecture.

In the simplest case:

- a message comes in through the page (level 1) which
- passes a message to the content script (level 2) that hands it onto
- the background script (level 3) which
- returns a response to the content script (level 2) which 
- passes the message to the page (level 1) which 
- resolves to the user

In the more complicated case:

1. a message comes in through the page (level 1) which 
2. passes a message to the content script (level 2) that 
3. hands it onto the background script (level 3) which 
4. needs to perform an execute script command (as part of an Eyes command, e.g., `eyes.open` or `eyes.check`) that 
5. sends a message to the content script requesting an `executeScript` command which
6. passes the message to the page which
7. runs the `executeScript` command with the provided args and
8. returns the result to the content script which
9. returns the message to the background script which
10. repeats steps 5 through 9 as needed to complete the command and then
11. completes the command and returns the result to the content script which
12. passes the result to the page which
13. resolves to the user

The current approach taken is to webpack `eyes-sdk-core` and use it, along with a spec-driver, inside of the background script.

## Build

There’s a build script that webpacks everything and outputs it into a build directory.

You can then load this artifact into the browser as a developer extension ([link](https://developer.chrome.com/extensions/getstarted#unpacked)). You can also do incremental builds by appending the `--watch` argument (e.g., `yarn build --watch`). 

__NOTE: There are two build scripts. One for the page scripts and another for the extension. Depending on where you make a code change, an incremental build might not contain your change since `--watch` only applies to the last `webpack` command. When in doubt, run without `--watch`.__

## Test

Testing in extensions is quite limited. But thankfully, there is no UI to this extension (which makes testing a bit easier). We're just passing messages and running commands in the correct browser context. The simplest way to test this is end-to-end. To that end we are doing that with Selenium, which enables us to launch Chrome with a browser extension preloaded. See `test/e2e/hello-world.spec.js` for details.

__NOTE: The `yarn:test` script builds the extension and runs the tests.__

## Debug

It's possible to debug the extension with the `debugger` keyword.

Place it in the part of the extension's code base that you're working in, build the extension (or wait for the watcher to rebuild if you're using `yarn build --watch`), and reload the extension in the browser. Then open the devtools for the part of the extension where you set the keyword (e.g., the devtools panel for the application under test, or by opening the devtools panel for the extension's background page).

When you run the application (e.g., executing an Eyes function exposed in the AUT) the `debugger` keyword will act as a breakpoint.

## Current Status

The spec has not been fully implemented yet. A build-as-needed approach was taken along with a focus on grid execution. So far, Eyes.open works, and part of Eyes.check. 

Things are hung up on one of the snippets -- `getElementMarkers`.

```
Uncaught TypeError: Cannot read property 'forEach' of undefined
```

__NOTE: To see this error, turn on the `eyes.check window (full page)` test in `hello-world.spec.js`, run it, and view the devtools console of the AUT.__

After this issue is resolved, the next error you'll run into is the use of `fs` in dom-snapshot. We accounted for this in the SIDE Eyes extension by requiring the CJS processPage file in dom-snapshot.

You'll see an error like this:

```
TypeError: The "original" argument must be of type Function
```

__NOTE: To see this error, turn on the `eyes.check window (full page)` test in `hello-world.spec.js`, run it, open a new tab in the browser, visit `chrome://extensions`, enable the `Developer mode` toggle (top-right of the page), and click `background page` link for the extension.__

It originates from getScripts in dom-snapshot (e.g., [here](https://github.com/applitools/dom-scripts/blob/master/packages/dom-snapshot/src/getScript.js#L8)).

## Open Questions

### scriptTimeout vs polling

The commands implemented in the page scripts are blocking. In order for them to complete, the script timeout of the browser automation tool needs to be taken into account. 

For example, Selenium WebDriver's default script timeout is 15 seconds. A check command can easily exceed this, and as such, needs to be increased. Which is possible through Selenium's capabilities. I'm assuming this kind of configuration is available in other browser automation tools as well, but needs to be confirmed.

Alternatively, we can make the commands non-blocking and instead implement polling in the client that sends commands to the page. This gets around the script timeout, but puts more implementation into the client which would need to be done in every client that uses the extension.

### CORS iframe support

It's not clear how well we can support CORS iframes yet. But from the browser extension we do have access to Chrome's remote debugging protocol ([docs](https://developer.chrome.com/docs/extensions/reference/debugger/), [reference implementation](https://github.com/SeleniumHQ/selenium-ide/blob/v3/packages/selenium-ide/src/neo/IO/debugger.js#L33)). So it seems plausible that we might be able to support them. Need to research to confirm, though.
