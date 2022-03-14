# Change Log

## Unreleased


## 2.0.1 - 2022/3/14

- update snippets to address Cypres universal (AUT is hosted in an iframe inside the Cypres shell)
- updated to @applitools/eyes-sdk-core@13.1.1 (from 13.1.0)
- updated to @applitools/visual-grid-client@15.10.1 (from 15.10.0)

## 2.0.0 - 2022/3/12

- update `Eyes.abort` so it fails gracefully when an Eyes instance is not found
- support AUTProxy
- support assigning 'scrollingElement' as 'body' or 'html' dom element
- rename manager.closeAllEyes to manager.closeManager
- add support for aborting unclosed Eyes sessions and returning their results as part of manager.closeManager
- updated to @applitools/eyes-sdk-core@13.1.0 (from 13.0.6)
- updated to @applitools/visual-grid-client@15.10.0 (from 15.9.0)

## 1.1.0 - 2022/2/20

- Add support to page coverage by adding `pageId` to `Eyes.check`.
- updated to @applitools/eyes-sdk-core@13.0.6 (from 13.0.4)
- updated to @applitools/visual-grid-client@15.9.0 (from 15.8.65)

## 1.0.9 - 2022/2/16

- handle issue when `process.send` is missing

## 1.0.8 - 2022/2/16

- fix image scaling on pages without viewport metatag
- fix safari's viewport detection on iOS devices
- enhance server start up protocol with ipc communication
- export `makeServerProcess` function to create a detached process
- add `--config` cli argument to provide server configuration as a json string instead of separate cli arguments (flags)
- updated to @applitools/eyes-sdk-core@13.0.4 (from 13.0.1)
- updated to @applitools/logger@1.0.11 (from 1.0.10)
- updated to @applitools/utils@1.2.13 (from 1.2.11)
- updated to @applitools/visual-grid-client@15.8.65 (from 15.8.63)

## 1.0.7 - 2022/2/4

- handle file system errors on logger
- updated to @applitools/eyes-sdk-core@13.0.1 (from 13.0.0)
- updated to @applitools/logger@1.0.10 (from 1.0.9)
- updated to @applitools/visual-grid-client@15.8.63 (from 15.8.62)

## 1.0.6 - 2022/1/19

- updated to @applitools/eyes-sdk-core@13.0.0 (from 12.24.14)
- updated to @applitools/visual-grid-client@15.8.62 (from 15.8.61)

### ⚠ BREAKING CHANGES
- change default behavior of `Eyes.check` command to take a full screenshot if screenshot target is a window

## 1.0.5 - 2022/1/17

- no changes

## 1.0.4 - 2022/1/17

- no changes

## 1.0.3 - 2022/1/17

- updated to @applitools/eyes-sdk-core@12.24.14 (from 12.24.10)
- updated to @applitools/visual-grid-client@15.8.61 (from 15.8.56)

## 1.0.2 - 2022/1/6

- fix W3C detection for browserstack capabilities
- handle shadow root element key
- updated to @applitools/logger@1.0.9 (from 1.0.8)

## 1.0.1 - 2022/1/5

- fix webdriver additional commands format

## 1.0.0 - 2022/1/5

- updated to @applitools/utils@1.2.11 (from 1.2.5)
- updated to @applitools/eyes-sdk-core@12.24.10 (from 12.24.9)
- updated to @applitools/visual-grid-client@15.8.56 (from 15.8.55)

## 0.2.3 - 2021/12/23

- updated to @applitools/eyes-sdk-core@12.24.9 (from 12.24.7)
- updated to @applitools/logger@1.0.8 (from 1.0.7)
- updated to @applitools/utils@1.2.5 (from 1.2.4)
- updated to @applitools/visual-grid-client@15.8.55 (from 15.8.53)

## 0.2.2 - 2021/12/20

- update nodejs version in binaries to 16 lts
- updated to @applitools/eyes-sdk-core@12.24.7 (from 12.24.6)
- updated to @applitools/visual-grid-client@15.8.53 (from 15.8.52)

## 0.2.1 - 2021/12/17

- updated to @applitools/eyes-sdk-core@12.24.6 (from 12.24.4)
- updated to @applitools/logger@1.0.7 (from 1.0.6)
- updated to @applitools/visual-grid-client@15.8.52 (from 15.8.48)

## 0.2.0 - 2021/11/23

- updated to @applitools/eyes-sdk-core@12.24.2 (from 12.23.12)
- updated to @applitools/logger@1.0.5 (from 1.0.4)
- updated to @applitools/utils@1.2.4 (from 1.2.3)
- updated to @applitools/visual-grid-client@15.8.47 (from 15.8.31)
- updated to @applitools/eyes-sdk-core@12.24.3 (from 12.24.2)
- updated to @applitools/eyes-sdk-core@12.24.4 (from 12.24.3)
- updated to @applitools/logger@1.0.6 (from 1.0.5)
- updated to @applitools/visual-grid-client@15.8.48 (from 15.8.47)

## 0.1.5 - 2021/9/27

- updated to @applitools/eyes-sdk-core@12.23.12 (from 12.23.7)
- updated to @applitools/visual-grid-client@15.8.31 (from 15.8.27)

## 0.1.4 - 2021/9/15

- replace `Session.init` with `Core.makeSDK`
- improve command tracking in debug mode
- update spec drivers to match latest requirements
- updated to @applitools/eyes-sdk-core@12.23.5 (from 12.23.1)
- updated to @applitools/utils@1.2.3 (from 1.2.2)
- updated to @applitools/visual-grid-client@15.8.25 (from 15.8.22)
- updated to @applitools/eyes-sdk-core@12.23.7 (from 12.23.5)
- updated to @applitools/visual-grid-client@15.8.27 (from 15.8.25)

## 0.1.3 - 2021/9/1

- fix default webdriver spec driver implementation for `isDriver` to allow driver declarations with `sessionId` and `serverUrl`

## 0.1.2 - 2021/9/1

- fix default webdriver spec driver implementation for `isDriver` to allow driver declarations with `sessionId` and `serverUrl`
## 0.1.1 - 2021/8/31

- add support for native screenshots and newest spec driver methods
- rename EyesManager.makeEyes to EyesManager.openEyes
- updated to @applitools/eyes-sdk-core@12.23.0 (from 12.21.1)
- updated to @applitools/utils@1.2.2 (from 1.2.0)
- updated to @applitools/visual-grid-client@15.8.21 (from 15.8.11)
- updated to @applitools/eyes-sdk-core@12.23.1 (from 12.23.0)
- updated to @applitools/visual-grid-client@15.8.22 (from 15.8.21)

## 0.1.0 - 2021/6/15

- updated to @applitools/eyes-sdk-core@12.21.1 (from 12.20.2)
- updated to @applitools/visual-grid-client@15.8.11 (from 15.8.8)

## 0.0.3 - 2021/6/1

- re-release

## 0.0.2 - 2021/6/1

- init
- updated to @applitools/eyes-sdk-core@12.20.2 (from 12.13.5)
- updated to @applitools/utils@1.2.0 (from 1.0.0)
- updated to @applitools/visual-grid-client@15.8.8 (from 15.5.11)
