# Changelog

## Unreleased


## 1.0.14 - 2021/9/15

- add `never` as default type argument value to  `Selector` type to use it as stand alone type
- make `transformSelector` optional same as other transformers 

## 1.0.13 - 2021/9/9

- add `Selector` type to wrap framework selectors with additional functionality
- remove `SpecSelector` type, so `SpecDriver` methods could now only accept framework selectors
- add `transformSelector` method to `SpecDriver` type

## 1.0.12 - 2021/9/6

- add functionality to find element within an element to `SpecDriver`
- extend `SpecSelector` to support nested structures

## 1.0.11 - 2021/9/1

- update universal `close` and `closeAllEyes` methods

## 1.0.10 - 2021/8/31

- add 'Pixel 5', 'Samsung Galaxy 20' and 'iPhone 12' to supported device names

## 1.0.9 - 2021/8/31

- add types for newest spec driver methods for universal interface

## 1.0.8 - 2021/8/13

- add optional property `statusBarHeight` to the `DriverInfo` type

## 1.0.7 - 2021/8/13

- add support for `throwErr` argument to `close` and `closeAllEyes`
- return array of tests results from `close` and `abort`

## 1.0.6 - 2021/8/3

- add element selector to `isStaleElementError`

## 1.0.5 - 2021/7/19

- isEqualElements is not required method in for SpecDriver anymore
- rename makeEyes to openEyes

## 1.0.4 - 2021/7/14

- make `parentContext` optional in `SpecDriver` type
- make `parentContext` optional in `SpecDriver` type
## 1.0.3 - 2021/6/15

- make `isContext` optional in `SpecDriver` type

## 1.0.2 - 2021/6/1

- add `SpecDriver`, `ClientSocket` and `ServerSocket` types

## 1.0.1 - 2021/5/24

- fix `logs` type in `Config.EyesConfig`
- add `Options.TextRegion` type to return from `Eyes#extractTextRegions`
- replace mapper types with `Record` in return values of `Eyes#extractTextRegions` and `Eyes#locate`

## 1.0.0 - 2021/5/23

- add basic core types and all relative input and outputs
