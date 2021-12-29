# Changelog

## Unreleased


## 2.3.17 - 2021/12/29

- pass test config, env, and meta to test function to modify behavior

## 2.3.16 - 2021/11/9

- replace deprecated `rmdirSync` with `rmSync`

## 2.3.15 - 2021/9/6

- remove unused dependencies

## 2.3.14 - 2021/7/30

- fix path resolution

## 2.3.13 - 2021/5/18

- fix coverage report calculation

## 2.3.12 - 2021/5/13

- remove support of `initializeSdk` and `overrideTests` configuration properties
- use cwd relative path to import files
- add support for remote config
- add integrated formatter
- add support of `extends` property in config file, which could be used to extend configurations
- allow `overrides` property to be not only path but also an object, or array with pathes and/or objects
- provide better logging for report command

## 2.3.11 - 2021/4/26

- include custom tests in report

## 2.3.9 - 2021/4/1

- add `api` parameter to test object in bongo report

## 2.3.8 - 2021/2/23

- fix bug with unskipped and unexecuted tests

## 2.3.7 - 2021/2/6

- Include non-emitted tests in the report

## 2.3.6 - 2021/1/31

- chore: add husky
- add `isSkipped` to test metadata

## 2.3.5 - 2021/1/15

- fix resultDir property

## 2.3.4 - 2021/1/14

- fix bug with not escaped backslashes (`\`) in a name of the key
- adjust cli and config option names

## 2.3.3 - 2021/1/11

- fix `addExpression`

## 2.3.2 - 2021/1/11

- add `.js` if extension is missed for remote files

## 2.3.1 - 2021/1/11

- fix remote multifile modules requiring
## 2.3.0 - 2021/1/6

- add operators support
- add auto variable name handling
- add support for remote multifile specs
- add expressions support

## 2.2.2 - 2020/12/29

- fix remote overrides
- fix remote overrides
## 2.2.1 - 2020/12/22

- fix type in getter

## 2.2.0 - 2020/12/22

- add types registration mechanism - `addType`
- add type cast mechanism
- add a possibility to register type-specific syntax variations

## 2.1.5 - 2020/12/17

- add a temporary solution for recursive types

## 2.1.4 - 2020/12/2

- add more metadata about the test
- add `skipEmit` flag to the test configuration and also cli flag `ignoreSkipEmit` to ignore the test flag
- change behavior of `emitOnly`

## 2.1.3 - 2020/11/25

- fix playwright report sdk name

## 2.1.2 - 2020/11/25

- fix metadata names

## 2.1.1 - 2020/11/25

- skipping heafull tests in CI

## 2.1.0 - 2020/11/17

- add eyes-puppeteer as a supported SDK

## 2.0.4 - 2020/11/16

- fix nested generic type parsing
- send reports to the dashboards by default

## 2.0.3 - 2020/11/12

- add a possibility to provide a nested type annotation
- fix strict emitOnly

## 2.0.2 - 2020/11/11

- fix bug when build crashes in case addCommand callback returns void

## 2.0.1 - 2020/11/2

- add emitOnly config property to chose which test(s) need to be emitted
- improve logging and error handling

## 2.0.0 - 2020/10/23

- new test file format
- improve emitting api
- rework cli commands

## 1.0.16 - 2020/10/7

- move azure to dependencies

## 1.0.15 - 2020/10/7

- remove yarn workspaces
- updated to axios@0.20.0 (from 0.19.2)
- updated to chalk@4.1.0 (from 3.0.0)
- updated to node-fetch@2.6.1 (from 2.6.0)
- updated to yargs@16.0.3 (from 15.0.2)
