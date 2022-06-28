## Summary

The Eyes extension for Selenium IDE is a browser extension that’s available for [Chrome](https://chrome.google.com/webstore/detail/applitools-for-selenium-i/fbnkflkahhlmhdgkddaafgnnokifobik) and [Firefox](https://addons.mozilla.org/en-US/firefox/addon/applitools-for-selenium-ide/) that acts as a plugin for [Selenium IDE](https://www.selenium.dev/selenium-ide/) to enable tests in Selenium IDE to use Eyes commands and connect to the Eyes service.

Behind the scenes the extension is a React application that uses two of our SDKs to support both classic and visual grid execution.

## User flows

There is a tutorial that gives a good overview of the extension [here](https://applitools.com/tutorials/selenium-ide.html). To give context about the 	overall architecture, a brief description of the primary user flows are included here.

### Installation & Setup

For the Eyes extension to work, Selenium IDE must be installed and open.

When opening the Eyes extension for the first time the user will be prompted for their API key and Eyes server (with a default value prefilled for the server).

Once the API key has been set, the user will see a screen to configure playback options.

### Recording a test

When recording a test in Selenium IDE, the user can open the Eyes extension to select an Eyes command to be added to the test (e.g., check window, check element, set viewport size, etc.).

### Playing back (in-browser)

In Selenium IDE you can play a test which was previously recorded. If there are Eyes commands in the test, then an Eyes session will be opened and the Eyes commands will be run as part of the test run.

There are two different execution modes when playing back a test in the browser -- Classic or Visual Grid.

The user can configure which is used by opening the Eyes extension and toggling the “Execute using Visual Grid” checkbox. When toggle is enabled, the user will be presented with a UI to select the different browser, viewport, device, and device orientation options they want.

## Architecture

### Plugin registration

Everything starts with the registration -- which requires Selenium IDE to be open (so Eyes can register with it).

The registration is made through the browser extension API, by making a request to Selenium IDE through its extension ID along with a payload (a.k.a. the plugin manifest, which can be seen [here](https://github.com/applitools/eyes.sdk.javascript1/blob/master/packages/side-eyes/src/background/plugin-manifest.json)).

In the payload we specify:

- the commands that the extension would like to add to Selenium IDE
- what languages are supported for code-export
- dependencies needed for execution in the command-line runner to work

NOTE: The languages listed for export align with the languages that are available through the Selenium IDE plugin API ([link](https://www.selenium.dev/selenium-ide/docs/en/plugins/code-export)).

### Events

[Selenium IDE fires events](https://www.selenium.dev/selenium-ide/docs/en/plugins/ide-events) which the Eyes extension can respond to.

Here are some of the primary ways the Eyes extension leverages these:

- When a test or suite is started -> open an Eyes session
- When a project file is saved -> provide the code necessary for the command-line runner to work for Eyes commands (to be stored in the SIDE project file)
- When the user exports a test or suite to a given language -> provide the Eyes SDK code necessary for the given language

The event interaction happens in the background script of the extension, which can be found in [src/background/index.js](https://github.com/applitools/eyes.sdk.javascript1/blob/master/packages/side-eyes/src/background/index.js). It’s worth noting that there is counter-intuitive behavior when responding to events asynchronously. See [this code-comment](https://github.com/applitools/eyes.sdk.javascript1/blob/master/packages/side-eyes/src/background/index.js#L143-L155) for details.

### UI

As mentioned earlier, the front-end for the extension is a React application.

It is a vanilla implementation in that it uses props and state as its primary source of state management. The long term storage that’s leveraged (to persist user specified settings after the browser is closed -- like what visual grid options to use, etc.) is local storage.

The important thing to know about the settings persisted to local storage is that they are bound to the ID of the Selenium IDE project that was open when configuring the settings.

All of the containers, components, and styles are available in [src/app](https://github.com/applitools/eyes.sdk.javascript1/tree/master/packages/side-eyes/src/app).

## SDK integration

For classic execution in the browser the [eyes-images](https://www.npmjs.com/package/@applitools/eyes-images) package is used.

For visual grid execution in the browser the [visual-grid-client](https://www.npmjs.com/package/@applitools/visual-grid-client) package is used.

For execution in the SIDE command-line runner the [eyes-selenium](https://www.npmjs.com/package/@applitools/eyes-selenium) package is used (the version that is used is specified in [the plugin manifest](https://github.com/applitools/eyes.sdk.javascript1/blob/master/packages/side-eyes/src/background/plugin-manifest.json#L85)).

For code export the eyes-selenium equivalent for each language is used (although the user needs to install the dependency themselves and run the test(s) on their own).

## Workflow

### Build

There’s a build script that webpacks everything and outputs it into a build directory.

You can then load this artifact into the browser as a developer extension (e.g., [in Chrome](https://developer.chrome.com/extensions/getstarted#unpacked), [in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)). You can also do incremental builds by appending the `--watch` argument (e.g., `yarn build --watch`).

### Test

Automated testing options for browser extensions (at least end-to-end) are quite limited. As a compromise unit and integration testing was used when possible.

For instance, to verify that the state management of the visual grid options picker, jsdom and react-testing-library were used to construct some user flow tests. Also, there is strong test coverage of code-export thanks to the use of fixtures (a.k.a. snapshots in Jest).

It’s worth noting that for the most part, the tests are laid out in __test__ folders alongside the source code that they verify. The e2e tests used to verify code-export in Docker containers is the exception, since it lives in the tests directory in the root of the package.

You can run all of the unit and integration tests with `yarn test`. You can also do incremental test runs with `yarn test --watch`.

Otherwise, you will need to verify functionality by hand. Some examples of this include:
- verify the UI in the extension
- verify behavior by running some tests with various settings
- re-save a SIDE project file (to get the latest emitted code) and running it with the command-line runner to verify it works
perform a code export in Selenium IDE to verify it works and contains Eyes code

### Debug

It's possible to debug the extension with the `debugger` keyword. Place it in the part of the extension's code base that you're working in, build the extension (or wait for the watcher to rebuild if you're using `yarn build --watch`), and reload the extension in the browser. Then open the devtools for the part of the extension where you set the breakpoint (e.g., the devtools panel for the application under test, or by opening the devtools panel for the extension's background page). When you run the application (e.g., click play in SIDE), and the `debugger` keyword will act as a breakpoint.

### Preparing Build Artifacts for Publishing

1. verify that you are on the `master` branch

2. `yarn version --patch` (or `--minor` or `--major`)

    This will run the preversion checks used in the other JS SDKs, as well as update the version in the browser extension manifest file (which is needed for publishing).

3. `git push`

    Git origin will now have the correct manifest version in the source code.

4. `yarn build`

    Now that you've versioned your release, you need to prepare a production build of it.

5. `yarn release:gh`

    To release you need a zipped archive of both the build directory and the source code of the project. There is a script (e.g., script/gh-release.js) which handles zipping the build directory and attaching it to a tagged release in GitHub. Although it needs to be updated due to deprecation warnings.

    The script relies on a GitHub personal access token (which you can set up [here](https://github.com/settings/tokens)) stored in an environment variable (e.g., `GH_TOKEN`).

    If the script is successful, then the tagged release will have both a zip of the build directory and a zip of the source directory.

    If for some reason the script was not successful and you need to zip up the source, you can use the following command locally instead -- `git archive --format zip --output /path/to/save/side-eyes-src.zip master`.

### Publishing

Publishing is a manual act. An attempt to automate publishing was done previously, but it didn't work reliably.

To publish you need an account with access to the extension in both the Chrome and Firefox web stores.

To upload for Chrome:

- Go to the GitHub release page for the project
- Download the zipped build directory (e.g., `selenium-ide.zip`)
- Go to Chrome Store dashboard
- Click `Upload Updated Package`
- Upload the zipped build directory (e.g., `selenium-ide.zip`)
- Click `Publish Changes`

To upload for Firefox:

- Go to the GitHub release page for the project
- Download the source zip file
- Upload both the zipped build directory (e.g., `selenium-ide.zip`) and the source zip file

- notes to reviewer:

```
In order to build the extension from source code, go to the folder
"packages/side-eyes" and run "yarn && yarn build".
The built extension will then be found in the "packages/side-eyes/build"
folder. This folder has the manifest.json file for the extension, and can
be loaded as a temporary extension into firefox for testing.

The above is also documented in the extension's source, at the file
"packages/side-eyes/CONTRIBUTING.md" in section "Workflow --> Build".

The extension was built using Linux Ubuntu 20.04 64 bit, Node.js 14.15.1,
and yarn 1.22.5
```

- Click to edit the release
- Set the Firefox version to 56 and Save

