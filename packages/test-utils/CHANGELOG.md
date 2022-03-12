# Changelog

## Unreleased

- troubleshooting

## 1.1.4 - 2022/3/12

- fix in waitForDockerBrowsers
- fix in waitForDockerBrowsers
## 1.1.3 - 2022/3/8

- update waitForDockerBrowsers so it retries when the status code is not 200 (instead of just rely on an exception to handle it)

## 1.1.2 - 2022/3/8

- update waitForDockerBrowsers to check the status of the fetch to see if it's 200
- set a sensible default for the remoteUrl in mocha-hooks
- append the /status route suffix (for a Selenium Hub) to the remoteUrl specified in mocha-hooks

## 1.1.1 - 2022/3/4

- add error handling when a URL is not provided when checking if a docker container is ready

## 1.1.0 - 2022/3/2

- add support for specifying by environment variable the number of retries when checking if a docker container is ready

## 1.0.12 - 2022/2/15

- add support for running Android native on Perfecto

## 1.0.11 - 2022/1/18

- fix firefox-48 capabilities for wdio

## 1.0.10 - 2021/12/16

- add more device and browser presets

## 1.0.9 - 2021/10/12

- fix non-w3c appium capabilities for sauce

## 1.0.8 - 2021/10/12

- add w3c preset for `Pixel 3a`

## 1.0.7 - 2021/8/9

- fix `parseEnv`
- fix `parseEnv`
## 1.0.6 - 2021/8/9

- add empty `browserName` if `app` is passed to `parseEnv`

## 1.0.5 - 2021/8/3

- add iPhone XS appium version

## 1.0.4 - 2021/6/15

- add `appium` flag for appium capabilities

## 1.0.3 - 2021/5/24

- add `sdk` property in `setupEyes`

## 1.0.2 - 2021/5/24

- add mochaGrep function to generate regexp for cvg tests

## 1.0.1 - 2021/5/24

- fix filename in logs config

## 1.0.0 - 2021/5/23

- Put all of the reusable test utilities and helpers in a separate package
