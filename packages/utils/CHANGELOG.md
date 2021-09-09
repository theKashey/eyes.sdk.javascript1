# Changelog

## Unreleased


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