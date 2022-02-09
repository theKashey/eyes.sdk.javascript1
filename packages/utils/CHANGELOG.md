# Changelog

## Unreleased


 ## 1.2.12 - 2022/2/9

- add string manupulation function 'pluralize' 

## 1.2.11 - 2021/12/28

- use git bush shell on windows

## 1.2.10 - 2021/12/28

- use default shell on windows

## 1.2.9 - 2021/12/28

- use default shell on windows

## 1.2.8 - 2021/12/28

- use default shell on windows

## 1.2.7 - 2021/12/28

- use `shell` option

## 1.2.6 - 2021/12/28

- add support for windows bash command execution

## 1.2.5 - 2021/12/22

- improve `geometry.rotate` to also rotate coordinates
- fix `geometry.isEmpty`
- fix `geometry.isIntersected`
- remove `guard.isGoogleFont` method form utils and transfer it to rGridResource

## 1.2.4 - 2021/10/27

- add a method to validate that a url is a google font resource

## 1.2.3 - 2021/9/9

- add `types.isPlainObject` to check that object is not an instance of any class

## 1.2.2 - 2021/8/7

- add `geometry.rotate` to rotate region and sizes to on certain number of degrees

## 1.2.1 - 2021/8/3

- fix overload order
- fix `gt` and `gte` properties behavior in `isNumber` argument guard

## 1.2.0 - 2021/5/23

- add process utilities

## 1.1.3 - 2021/4/12

- add utility types

## 1.1.2 - 2021/3/31

- fix `types.instanceOf` will immediately return `false` for non-object values

## 1.1.1 - 2021/3/25

- add `general.toJSON` one argument signature to convert class instances to plain objects

## 1.1.0 - 2021/3/24

- add `general.jwtDecode` function
- add `guard.isOneOf` function
- add `types.isEmpty` function for arrays, object, and string
- add `types.instanceOf` signature with ctor name as a second argument instead of ctor itself
- fix issue with not strict guards
- improve guard's error messages

## 1.0.1 - 2021/1/27

- chore: add husky

## 1.0.0 - 2020/12/1

- Provide general utils, geometry utils, types utils and argument guard written with ts