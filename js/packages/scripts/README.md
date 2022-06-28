## Getting Started

### Linking

This is used to link dependent packages to the package your are currently cd'd into. Currently, you need to explicitly specify the packages you want linked.

`npx link --help` to see available options.

Here's an example:

```
// cd into the package you are working in
cd packages/eyes-sdk-core

// link the relevant packages
npx link --runInstall true --runBuild true --include types driver spec-driver-selenium visual-grid-client

// verify they are linked by checking for symlinks
ls -al node_modules/@applitools
```
