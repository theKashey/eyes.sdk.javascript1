# Change Log

## Unreleased


## 1.4.16 - 2022/2/16

- updated to @applitools/snippets@2.1.15 (from 2.1.14)

## 1.4.15 - 2022/2/15

- updated to @applitools/snippets@2.1.14 (from 2.1.13)

## 1.4.14 - 2022/2/15

- add `viewportScale` getter to `Driver` class
- updated to @applitools/snippets@2.1.13 (from 2.1.12)
- updated to @applitools/types@1.0.25 (from 1.0.24)
- updated to @applitools/utils@1.2.13 (from 1.2.12)

## 1.4.13 - 2022/2/10

- fix android helper
- updated to @applitools/utils@1.2.12 (from 1.2.11)

## 1.4.12 - 2022/2/8

- fix usage of `-ios class chain` selectors

## 1.4.11 - 2022/2/8

- use `-ios class chain` selectors instead of `class name` for iOS specific elements

## 1.4.10 - 2022/2/4

- updated to @applitools/types@1.0.24 (from 1.0.23)

### 📝 DOCUMENTATION
- Create a README.md with a description for basic concepts and spec driver methods.

## 1.4.9 - 2022/1/12

- handle case with `spec.getCookies` throws an error when trying to get cookies of the browser

## 1.4.8 - 2022/1/5

- handle legacy appium capabilities
- updated to @applitools/utils@1.2.11 (from 1.2.5)

## 1.4.7 - 2021/12/22

- updated to @applitools/snippets@2.1.12 (from 2.1.11)

## 1.4.6 - 2021/12/22

- extract device orientation in `Driver`'s `init` and provide readonly access through the `orientation` getter of the `Driver`
- updated to @applitools/snippets@2.1.11 (from 2.1.10)
- updated to @applitools/types@1.0.23 (from 1.0.22)
- updated to @applitools/utils@1.2.5 (from 1.2.4)

## 1.4.5 - 2021/12/20

- improve native android app scrolling performance
- fix bug with `Buffer.from` and base64
- updated to @applitools/snippets@2.1.10 (from 2.1.9)

## 1.4.3 - 2021/12/17

- convert base64 result of `spec.takeScreenshot` to `Buffer` before return it from `Driver`'s `takeScreenshot` method
- updated to @applitools/snippets@2.1.9 (from 2.1.8)

## 1.4.2 - 2021/12/16

- fix exports subpathes

## 1.4.1 - 2021/12/16

- updated to @applitools/snippets@2.1.8 (from 2.1.7)

## 1.4.0 - 2021/12/16

- improve native apps scrolling automation
- fix ios safe area related issues
- add helper library abstraction to cover appium edge cases
- made `setViewportSize` more reliable in worst case scenario and faster in best case scenario
- updated to @applitools/types@1.0.22 (from 1.0.21)

## 1.3.5 - 2021/11/23

- updated to @applitools/types@1.0.21 (from 1.0.20)

## 1.3.4 - 2021/11/18

- fix capabilities parsing for native apps

## 1.3.3 - 2021/11/14

- do not throw if `getCookies` method is missed in spec driver

## 1.3.2 - 2021/11/14

- adjust scrolling algorithm on native devices

## 1.3.1 - 2021/11/14

- add in-house capability parsing and system bars size handling mechanisms
- adjust scrolling algorithm on native devices
- support cookies
- updated to @applitools/types@1.0.20 (from 1.0.19)

## 1.3.0 - 2021/11/10

- updated to @applitools/types@1.0.19 (from 1.0.18)

## 1.3.0 - 2021/11/10

- updated to @applitools/types@1.0.19 (from 1.0.18)

## 1.2.7 - 2021/10/30

- updated to @applitools/types@1.0.18 (from 1.0.14)
- updated to @applitools/utils@1.2.4 (from 1.2.3)

## 1.2.6 - 2021/10/7

- fix issue with fractional viewport size on mobile devices

## 1.2.5 - 2021/10/5

- fix issue with wrong user agent overrides valid driver info

## 1.2.4 - 2021/9/24

- fix issue with switching to the duplicated context

## 1.2.3 - 2021/9/24

- updated to @applitools/types@1.0.14 (from 1.0.13)

## 1.2.2 - 2021/9/10

- no changes

## 1.2.1 - 2021/9/10

- fix mocked scripts in MockDriver

## 1.2.0 - 2021/9/9

- add support for deep selectors
- updated to @applitools/snippets@2.1.7 (from 2.1.6)
- updated to @applitools/types@1.0.13 (from 1.0.12)
- updated to @applitools/utils@1.2.3 (from 1.2.2)

## 1.1.5 - 2021/9/6

- updated to @applitools/snippets@2.1.6 (from 2.1.5)

## 1.1.4 - 2021/9/6

- add support of reach spec selectors with shadow properties
- updated to @applitools/snippets@2.1.5 (from 2.1.4)
- updated to @applitools/types@1.0.12 (from 1.0.8)

## 1.1.3 - 2021/8/13

- add `statusBarHeight` getter to the driver
- handle base64 screenshots with line breaks
- handle iOS issue with returning actual scroll position after scrolling
- updated to @applitools/types@1.0.8 (from 1.0.6)

## 1.1.2 - 2021/8/8

- fix default method to compare elements

## 1.1.1 - 2021/8/7

- improve context and element location calculations
- updated to @applitools/utils@1.2.2 (from 1.2.1)

## 1.1.0 - 2021/8/4

- add types support
- add default implementation for element comparison
- add native device automation support
- updated to @applitools/types@1.0.5 (from 1.0.4)
- updated to @applitools/snippets@2.1.4 (from 2.1.3)
- updated to @applitools/types@1.0.6 (from 1.0.5)
- updated to @applitools/utils@1.2.1 (from 1.2.0)

## 1.0.7 - 2021/6/8

- replace setWindowRect with setWindowSize

## 1.0.6 - 2021/5/24

- updated to @applitools/utils@1.2.0 (from 1.1.3)

## 1.0.5 - 2021/5/11

- updated to @applitools/snippets@2.1.3 (from 2.1.1)
- updated to @applitools/utils@1.1.3 (from 1.0.1)

## 1.0.4 - 2021/1/27

- no changes

## 1.0.3 - 2021/1/27

- chore: add husky
- updated to @applitools/snippets@2.1.1 (from 2.1.0)
- updated to @applitools/utils@1.0.1 (from 1.0.0)

## 1.0.2 - 2020/12/29

- add `setTransforms` method to element
- add `setTransforms` method to element
## 1.0.1 - 2020/12/1

- add getTransforms method to the element

## 1.0.0 - 2020/12/1

- Provide a framework-agnostic way to work with webdriver/cdp drivers