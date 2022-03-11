#!/bin/bash
cd ../logger
rm -rf node_modules/@applitools
yarn install --force
yarn link
cd ../types
rm -rf node_modules/@applitools
yarn install --force
yarn build
yarn link
cd ../test-utils
rm -rf node_modules/@applitools
yarn install --force
yarn link
cd ../utils
rm -rf node_modules/@applitools
yarn install --force
yarn build
yarn link
cd ../snippets
rm -rf node_modules/@applitools
yarn install --force
yarn build
yarn link
cd ../driver
rm -rf node_modules/@applitools
yarn install --force
yarn link @applitools/snippets
yarn link @applitools/utils
yarn link @applitools/types
yarn build
yarn link
cd ../screenshoter
rm -rf node_modules/@applitools
yarn install --force
yarn link @applitools/types
yarn link @applitools/snippets
yarn link @applitools/utils
yarn link @applitools/driver
yarn link @applitools/test-utils
yarn link
cd ../eyes-sdk-core
rm -rf node_modules/@applitools
yarn install --force
yarn link @applitools/types
yarn link @applitools/snippets
yarn link @applitools/utils
yarn link @applitools/driver
yarn link @applitools/test-utils
yarn link @applitools/screenshoter
yarn link @applitools/logger
yarn link
cd ../visual-grid-client
rm -rf node_modules/@applitools
yarn install --force
yarn link @applitools/types
yarn link @applitools/snippets
yarn link @applitools/utils
yarn link @applitools/driver
yarn link @applitools/test-utils
yarn link @applitools/screenshoter
yarn link @applitools/eyes-sdk-core
yarn link @applitools/logger
yarn link
cd ../eyes-api
rm -rf node_modules/@applitools
yarn install --force
yarn link @applitools/utils
yarn link @applitools/types
yarn link @applitools/logger
yarn build
yarn link
cd ../eyes-selenium
rm -rf node_modules/@applitools
yarn install --force
yarn link @applitools/utils
yarn link @applitools/types
yarn link @applitools/driver
yarn link @applitools/snippets
yarn link @applitools/screenshoter
yarn link @applitools/test-utils
yarn link @applitools/eyes-api
yarn link @applitools/eyes-sdk-core
yarn link @applitools/visual-grid-client
yarn build
