# Change Log

## Unreleased












## 1.17.4 - 2022/8/25

### Features
- Don't fail `eyes.open` when there is a failure to set viewport size in `UFG`.
### Bug fixes
- Added `next` sub-module to support `index.d.ts`. added it both with `exports` and `typesVersions`
- fix selector issue in `testcafe`, the selector and the element are the same and once there are multi selector the it's only peak the element

## 1.17.3 - 2022/7/28

### Features
- Add the ability for the SDK to lazy load the page prior to performing a check window
- Support padding for regions in the following region types - ignoreRegions, layoutRegions, strictRegions, contentRegions
### Bug fixes
- Fix calling `waitBeforeCapture` when failed to set required viewport size
- Fix rendering issues with Salesforce Lightning design system
- Fix issue that prevented self-signed certificates from working when connecting through a proxy server
- Allow configuration file to be loaded from ancestor directories
- Fixed bug where a failure in a single UFG environment fails all other environments in the same configuration
- Better support in DOM slot element

## 1.17.2 - 2022/6/8

### Features
- Allowed `` values in custom properties
### Bug fixes
- Fixed broken links to enums implementation in the README.md
- Fixed `forceFullPageScreenshot` option behavior

## 1.17.1 - 2022/6/2

### Features
### Bug fixes
- Fix rounding error of image size when scaling introduces fractions

## 1.17.0 - 2022/6/1

### Features
- Dorp support for Node.js versions <=12
### Bug fixes
- Fixed incorrect calculation of coded regions in classic mode when using CSS stitching

## 1.16.2 - 2022/5/27

### Features
### Bug fixes
- Fixed `CheckSetting`'s `fully` being overridden by `Configuration`'s `forceFullPageScreenshot`
- Set EyesExceptions (such as new test, diffs exception and failed test exception) to exception property in TestResultsSummary
- Returned support of `showLogs` in configuration file and object
- Improve error message when failed to set viewport size

## 1.16.1 - 2022/5/19

### Features
- Support Galaxy S22 `DeviceName.Galaxy_S22` emulation device
### Bug fixes
- Fixed the error with importing `testcafe` module

## 1.16.0 - 2022/5/17

### Features
- Support UFG for native mobile
- `runner.getAllTestResults` returns the corresponding UFG browser/device configuration for each test. This is available as `runner.getAllTestResults()[i].browserInfo`.
- Support `failTestcafeOnDiff` as environment variable `APPLITOOLS_FAIL_TESTCAFE_ON_DIFF`
- Support iPhone SE `IosDeviceName.iPhone_SE` and iPhone 8 Plus `IosDeviceName.iPhone_8_Plus` iOS devices
### Bug fixes
- `runner.getAllTestResults` now aborts unclosed tests
- `runner.getAllTestResults` now returns all results, including aborted tests
- `extractText` now supports regions that don't use hints while using `x`/`y` coordinates
- Support data urls in iframes

## 1.15.5 - 2022/2/22

- add support for configuring notifyOnCompletion through an environment variable ([Trello](https://trello.com/c/WWdwQvpv))
- updated to @applitools/eyes-sdk-core@13.0.6 (from 13.0.5)
- updated to @applitools/visual-grid-client@15.9.0 (from 15.8.65)

## 1.15.4 - 2022/2/16

- fixing: Screenshotter dependency consuming 40+ MB of space
- updated to @applitools/eyes-api@1.1.8 (from 1.1.7)
- updated to @applitools/eyes-sdk-core@13.0.5 (from 13.0.0)
- updated to @applitools/utils@1.2.13 (from 1.2.11)
- updated to @applitools/visual-grid-client@15.8.65 (from 15.8.62)
- updated to @applitools/visual-grid-client@15.8.65 (from 15.8.62)
## 1.15.3 - 2022/1/24

- updated 'Agent ID' to 'eyes.testcafe' (from 'eyes.webdriverio')
- updated to @applitools/eyes-api@1.1.7 (from 1.1.6)
- updated to @applitools/eyes-sdk-core@13.0.0 (from 12.24.13)
- updated to @applitools/visual-grid-client@15.8.62 (from 15.8.60)

## 1.15.2 - 2022/1/14

- remove `esModuleInterop` ts compile option

## 1.15.1 - 2022/1/13

- set failTestcafeOnDiff default value to true
- updated to @applitools/eyes-api@1.1.6 (from 1.1.0)
- updated to @applitools/eyes-sdk-core@12.24.9 (from 12.23.3)
- updated to @applitools/utils@1.2.11 (from 1.2.2)
- updated to @applitools/visual-grid-client@15.8.55 (from 15.8.24)
- updated to @applitools/eyes-sdk-core@12.24.13 (from 12.24.9)
- updated to @applitools/visual-grid-client@15.8.60 (from 15.8.55)

## 1.15.0 - 2021/9/6

- updated to @applitools/eyes-api@1.1.0 (from 1.0.7)
- updated to @applitools/eyes-sdk-core@12.23.3 (from 12.21.5)
- updated to @applitools/utils@1.2.2 (from 1.2.0)
- updated to @applitools/visual-grid-client@15.8.24 (from 15.8.13)

## 1.14.3 - 2021/7/14

- fix issue with `Eyes` being exported as a type from legacy type definition file

## 1.14.2 - 2021/7/14

- introduced @applitools/eyes-api package with new api
- updated to @applitools/eyes-api@1.0.7 (from 1.0.3)
- updated to @applitools/eyes-sdk-core@12.21.5 (from 12.20.0)
- updated to @applitools/visual-grid-client@15.8.13 (from 15.8.7)

## 1.14.1 - 2021/5/25

- added full typescript support
- introduced @applitools/eyes-api package with new api
- updated to @applitools/eyes-api@1.0.3 (from 1.0.1)
- updated to @applitools/eyes-sdk-core@12.20.0 (from 12.19.3)
- updated to @applitools/utils@1.2.0 (from 1.1.3)
- updated to @applitools/visual-grid-client@15.8.7 (from 15.8.6)

## 1.14.0 - 2021/5/13

- added full typescript support
- introduced @applitools/eyes-api package with new api
- updated to @applitools/eyes-api@1.0.1 (from 0.0.2)
- updated to @applitools/eyes-sdk-core@12.19.3 (from 12.14.2)
- updated to @applitools/utils@1.1.3 (from 1.1.0)
- updated to @applitools/visual-grid-client@15.8.6 (from 15.5.14)

## 1.13.1 - 2021/4/22

- fix types for eyes open
- updated to @applitools/visual-grid-client@15.8.1 (from 15.8.0)

## 1.13.0 - 2021/4/22

- updated to @applitools/visual-grid-client@15.8.0 (from 15.7.1)

## 1.12.8 - 2021/4/6

- updated to @applitools/eyes-sdk-core@12.17.2 (from 12.16.0)
- updated to @applitools/visual-grid-client@15.7.1 (from 15.6.0)

## 1.12.7 - 2021/3/15

- updated to @applitools/eyes-sdk-core@12.16.0 (from 12.15.0)

## 1.12.6 - 2021/3/3

- fix bug that prevented window resizing from working reliably ([Trello](https://trello.com/c/xNCZNfPi))
- updated to @applitools/eyes-sdk-core@12.15.0 (from 12.14.10)
- updated to @applitools/visual-grid-client@15.6.0 (from 15.5.20)

## 1.12.5 - 2021/2/2

- fix default checkWindow behavior- take full page when no target is specified
- set minimum supported Node version to be consistent with other SDKs (8.9)
- updated to @applitools/eyes-sdk-core@12.14.7 (from 12.14.2)
- updated to @applitools/visual-grid-client@15.5.20 (from 15.5.13)

## 1.12.4 - 2021/1/27

- chore: add husky
- update peer dependency version of testcafe to include earlier versions (e.g., 1.7.x)
- fix issue where the browser is in an invalid state but eyes.open tries to proceed ([Trello](https://trello.com/c/xNCZNfPi))
- updated to @applitools/eyes-sdk-core@12.14.2 (from 12.13.0)
- updated to @applitools/visual-grid-client@15.5.13 (from 15.5.6)

## 1.12.3 - 2021/1/13

- fix for fetching font-face resources from stylesheets [Trello](https://trello.com/c/DwmxtRoR)
- updated to @applitools/eyes-sdk-core@12.13.0 (from 12.12.2)
- updated to @applitools/visual-grid-client@15.5.6 (from 15.5.5)

## 1.12.2 - 2021/1/11

- fixed default checkWindow behavior (when no options are provided) to respect backwards compatibility -- so it captures a full page screenshot instead of just the viewport
- fixed bug in specifying a tag name in checkWindow
- updated to @applitools/eyes-sdk-core@12.12.2 (from 12.12.1)
- updated to @applitools/visual-grid-client@15.5.5 (from 15.5.4)

## 1.12.1 - 2021/1/9

- fix performance issue with checkWindow command when used on pages of a non-trivial size
- updated to @applitools/eyes-sdk-core@12.12.1 (from 12.12.0)
- updated to @applitools/visual-grid-client@15.5.4 (from 15.5.3)

## 1.12.0 - 2021/1/9

- Updated SDK to use new core with backwards compatibility for existing API [Trello](https://trello.com/c/MZimmaSV)
- Added support for new Eyes concurrency model [Trello](https://trello.com/c/a7xq2hlL)
- Added JS layout support [Trello](https://trello.com/c/9dzS8FhB)
- Added CORS iframe support [Trello](https://trello.com/c/wPl3ef7y)
- Fix bugs in fetching resources due to TestCafe reverse proxy URLs [Trello](https://trello.com/c/nlMUhJTp)
- updated to @applitools/visual-grid-client@15.5.3 (from 15.5.0)

## earlier versions

- omitted
