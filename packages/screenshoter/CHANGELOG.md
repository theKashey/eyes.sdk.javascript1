
# Change Log

## Unreleased


## 3.3.5 - 2022/2/8

- add "files" field to the package.json to avoid unnecessary files to be published
- updated to @applitools/utils@1.2.11 (from 1.2.5)

## 3.3.4 - 2021/12/23

- updated to @applitools/snippets@2.1.12 (from 2.1.11)

## 3.3.3 - 2021/12/22

- improve default rotation and scaling logic
- improve scroll into viewport algorithm
- fix lazy handling of image rotation
- updated to @applitools/snippets@2.1.11 (from 2.1.10)
- updated to @applitools/utils@1.2.5 (from 1.2.4)

## 3.3.2 - 2021/12/20

- add basic support of webview screenshots on ios
- updated to @applitools/snippets@2.1.10 (from 2.1.8)

## 3.3.1 - 2021/12/17

- no changes

## 3.3.0 - 2021/12/16

- fix ios web screenshots on pages without viewport meta tag
- improve native apps support
- updated to @applitools/snippets@2.1.8 (from 2.1.7)

## 3.2.9 - 2021/11/14

- add support of scrollable elements that change its size during scrolling

## 3.2.8 - 2021/10/30

- updated to @applitools/utils@1.2.4 (from 1.2.3)

## 3.2.7 - 2021/10/13

- handle a case when scrolling element does not exist

## 3.2.6 - 2021/10/12

- handle a case when scrolling element does not exist

## 3.2.5 - 2021/10/5

- fix issue with fractional image size after scaling

## 3.2.4 - 2021/9/9

- handle selectors that evaluate to elements from a different context
- updated to @applitools/snippets@2.1.7 (from 2.1.4)
- updated to @applitools/utils@1.2.3 (from 1.2.2)

## 3.2.3 - 2021/8/13

- remove base64 sanitizing

## 3.2.2 - 2021/8/13

- add `withStatusBar` capability property to take app and full app screenshots with status bar
- fix ios web screenshots

## 3.2.1 - 2021/8/8

- no changes

## 3.2.0 - 2021/8/7

- change image processing order and improve general algorithm
- updated to @applitools/utils@1.2.2 (from 1.2.1)

## 3.1.0 - 2021/8/4

- improve support of native devices
- updated to @applitools/snippets@2.1.4 (from 2.1.3)
- updated to @applitools/utils@1.2.1 (from 1.2.0)

## 3.0.8 - 2021/5/24

- updated to @applitools/utils@1.2.0 (from 1.1.3)

## 3.0.7 - 2021/5/13

- fixed image cropping algorithm to not copy data into a heap
- optimized image rotation and image copping algorithms

## 3.0.6 - 2021/5/11

- updated to @applitools/utils@1.1.3 (from 1.0.1)

 ## 3.0.5 - 2021/2/18

- fix bug with wrong stitching due to fractional offset 

## 3.0.4 - 2021/2/15

- fix scaling issue
- handle firefox buggy versions

## 3.0.3 - 2021/1/27

- no changes
- updated to @applitools/utils@1.0.1 (from 1.0.0)
- updated to @applitools/utils@1.0.1 (from 1.0.0)
## 3.0.2 - 2021/1/27

- no changes
## 3.0.1 - 2021/1/27
- no changes
## 3.0.0 - 2021/1/26

- `crop`, `scale` and `rotate` now should be placed in `stabilization` object
- rename `context` to `frames`
- rename `isFully` to `fully`
- integrate dom-capture
- chore: add husky
- fix bug when screenshots on iPad were taken with Safari navigation bar and iOS status bar

## 2.1.1 - 2021/1/15

- fix bug when `toPng` method returns empty buffer
- fix bug when `toPng` method returns empty buffer
## 2.1.0 - 2021/1/15

- remove native module dependency (`sharp`)

## 2.0.0 - 2021/1/7

- return image location relative to viewport
- return image location relative to viewport
## 1.0.2 - 2020/12/29

- fix saveScreenshot
## 1.0.1 - 2020/12/1

- round coordinate and size before image operations

## 1.0.0 - 2020/12/1

- Provide functionality to take screenshots (viewport and full) using Applitools driver wrapper
