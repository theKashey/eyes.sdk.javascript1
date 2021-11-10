# Changelog

## Unreleased

## 1.1.6 - 2021/11/10

- updated to @applitools/types@1.0.19 (from 1.0.18)

## 1.1.5 - 2021/10/30

- updated to @applitools/logger@1.0.5 (from 1.0.4)
- updated to @applitools/types@1.0.16 (from 1.0.15)
- updated to @applitools/utils@1.2.4 (from 1.2.3)
- update IosDeviceNameEnum enum
- updated to @applitools/types@1.0.18 (from 1.0.16)

## 1.1.4 - 2021/10/12

- add `waitBeforeCapture` configuration property
- updated to @applitools/types@1.0.15 (from 1.0.14)

## 1.1.3 - 2021/10/7

- rename `testId` to `id` in `TestResults`

## 1.1.2 - 2021/9/24

- add `LegacyRegion` type to support regions with `left` and `top` instead of `x` and `y`
- updated to @applitools/types@1.0.14 (from 1.0.13)

## 1.1.1 - 2021/9/9

- add `EyesSelector` type and use it to wrap framework selector type all over api
- updated to @applitools/logger@1.0.4 (from 1.0.3)
- updated to @applitools/types@1.0.13 (from 1.0.12)
- updated to @applitools/utils@1.2.3 (from 1.2.2)

## 1.1.0 - 2021/9/6

- add `CheckSettingsFluent#shadow` method to allow specifying region selectors for elements in shadow dom
- updated to @applitools/types@1.0.12 (from 1.0.10)

## 1.0.13 - 2021/8/31

- allow string literals to be set in data classes and fluent api
- updated to @applitools/types@1.0.9 (from 1.0.7)
- updated to @applitools/types@1.0.10 (from 1.0.9)

## 1.0.12 - 2021/8/13

- use core implementation for error throwing in `Eyes#close` and `EyesRunner#getAllTestResults`
- updated to @applitools/types@1.0.7 (from 1.0.6)

## 1.0.11 - 2021/8/7

- updated to @applitools/logger@1.0.3 (from 1.0.2)
- updated to @applitools/utils@1.2.2 (from 1.2.1)

## 1.0.10 - 2021/8/4

- updated to @applitools/types@1.0.6 (from 1.0.5)
- updated to @applitools/utils@1.2.1 (from 1.2.0)
- updated to @applitools/logger@1.0.2 (from 1.0.1)

## 1.0.9 - 2021/7/19

- updated to @applitools/types@1.0.5 (from 1.0.3)

## 1.0.8 - 2021/7/19

- rename makeEyes to openEyes

## 1.0.7 - 2021/6/30

- create plain enums types

## 1.0.6 - 2021/6/27

- support thenable webdrivers

## 1.0.5 - 2021/6/15

- updated to @applitools/types@1.0.3 (from 1.0.2)

## 1.0.4 - 2021/6/15

- add auto id generation for batch info
- read default values for some configuration properties from environment variables
- change default `throwErr` argument value in `EyesRunner::getAllTestResults` from `false` to `true`
- fix `Eyes` constructor to support the first argument as `null` and second as a `Configuration` object
- updated to @applitools/types@1.0.2 (from 1.0.1)

## 1.0.3 - 2021/5/24

- fix `EyesRunner#getAllTestResults` behavior when no eyes attached
- fix missing `properties` array in `Configuration`
- fix `logs` format in `Configuration`
- improve string formatting for `Location`, `RectangleSize` and `Region` data classes
- fix return value of `Eyes#extractTextRegions`
- fix usage of enums and string literals
- updated to @applitools/types@1.0.1 (from 1.0.0)

## 1.0.2 - 2021/5/23

- remove unused `RenderingInfo` and RunningSession types
- rename `BrowserName` to `BrowserType`
- allow sting values instead of enums in Plain types
- use `@applitools/types` package to describe internal types
- add spec to the `EyesRunner`
- updated to @applitools/logger@1.0.1 (from 1.0.0)
- updated to @applitools/utils@1.2.0 (from 1.1.3)

## 1.0.1 - 2021/5/12

- allow VisualGridRunner to be constructed without argument

## 1.0.0 - 2021/5/11

- rename variantId to variationGroupId
- added strict type definition of CheckSettings.hooks

## 0.1.0 - 2021/4/13

- renamed TestResultsContainer to TestResultContainer

## 0.0.3 - 2021/4/12

- make output classes readonly
- move TestAccessibilityStatus to its own file
- add variantId to CheckSettings
- updated to @applitools/utils@1.1.3 (from 1.1.1)
- updated to @applitools/logger@1.0.0 (from 0.0.2)

## 0.0.2 - 2021/3/24

- initial implementation of API layer for js eyes SDKs