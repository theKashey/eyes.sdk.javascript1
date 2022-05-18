const assert = require('assert')
const {makeDependencyTree, filterDependencyTreeByPackageName} = require('../../src/tree')
const {makePackagesList} = require('../../src/versions/versions-utils')
const path = require('path')

describe('tree', () => {
  it('creates a collection of packages sorted by publishing order', () => {
    const pkgs = [
      {
        name: 'a',
        dependencies: {
          // types
          h: '1',
        },
      },
      {
        name: 'b',
        dependencies: {
          // utils
          h: '1',
        },
      },
      {
        name: 'c',
        dependencies: {
          // logger
          h: '1',
        },
      },
      {
        name: 'd',
        dependencies: {
          // test-utils
          h: '1',
        },
      },
      {
        name: 'e',
        dependencies: {
          // snippets
          h: '1',
        },
      },
      {
        name: 'f',
        dependencies: {
          // spec-driver-selenium
          a: '1',
          b: '1',
          h: '1',
        },
      },
      {
        name: 'g',
        dependencies: {
          // eyes-api
          a: '1',
          h: '1',
        },
      },
      {
        name: 'h',
        dependencies: {
          // bongo
          b: '1',
        },
      },
      {
        name: 'i',
        dependencies: {
          // driver
          a: '1',
          b: '1',
          e: '1',
          h: '1',
        },
      },
      {
        name: 'j',
        dependencies: {
          // screenshoter
          b: '1',
          e: '1',
          h: '1',
        },
      },
      {
        name: 'k',
        dependencies: {
          // core
          a: '1',
          i: '1',
          c: '1',
          j: '1',
          e: '1',
          h: '1',
          d: '1',
        },
      },
      {
        name: 'l',
        dependencies: {
          // vgc
          k: '1',
          c: '1',
          h: '1',
          d: '1',
        },
      },
      {
        name: 'm',
        dependencies: {
          // eyes-selenium
          f: '1',
          g: '1',
          k: '1',
          l: '1',
          h: '1',
          d: '1',
        },
      },
      {
        name: 'n',
        dependencies: {
          // universal
          k: '1',
          l: '1',
          c: '1',
          h: '1',
          d: '1',
        },
      },
      {
        name: 'o',
        dependencies: {
          // eyes-cypress
          g: '1',
          n: '1',
          c: '1',
          l: '1',
          h: '1',
          d: '1',
        },
      },
    ]
    const {tree: result} = makeDependencyTree(pkgs, {ignoreLegacy: false})
    assert.deepStrictEqual(result, [
      ['b'], // utils
      ['h'], // bongo
      ['a', 'e'], // types, snippets
      ['i', 'c', 'j', 'd'], // driver, logger, screenshoter, test-utils
      ['k'], // core
      ['l'], // vgc
      ['f', 'g', 'n'], // sp-sel, eyes-api, universal
      ['m', 'o'], // sel, cy
    ])
  })
  it('works with "live" data', () => {
    const {tree, packages} = makeDependencyTree(
      makePackagesList(path.join(__dirname, 'fixtures', 'packages')),
    )
    assert.deepStrictEqual(tree.flat().length, packages.length)
    assert.deepStrictEqual(
      [
        ['@applitools/bongo'],
        ['@applitools/snippets', '@applitools/types', '@applitools/utils', '@applitools/scripts'],
        [
          '@applitools/driver',
          '@applitools/logger',
          '@applitools/screenshoter',
          '@applitools/sdk-fake-eyes-server',
        ],
        ['@applitools/eyes-sdk-core', '@applitools/api-extractor'],
        [
          '@applitools/visual-grid-client',
          '@applitools/eyes-api',
          '@applitools/spec-driver-webdriverio',
          '@applitools/sdk-coverage-tests',
          '@applitools/sdk-shared',
        ],
        [
          '@applitools/eyes-universal',
          '@applitools/spec-driver-playwright',
          '@applitools/spec-driver-puppeteer',
          '@applitools/spec-driver-selenium',
          '@applitools/test-server',
          '@applitools/eyes-webdriverio',
          '@applitools/test-utils',
          '@applitools/eyes-images',
          '@applitools/snaptdout',
        ],
        [
          'eyes-browser-extension',
          '@applitools/eyes-cypress',
          '@applitools/eyes-nightwatch',
          '@applitools/eyes-playwright',
          '@applitools/eyes-playwright-universal',
          '@applitools/eyes-protractor',
          '@applitools/eyes-puppeteer',
          '@applitools/eyes-selenium',
          '@applitools/eyes-selenium-universal',
          '@applitools/eyes-storybook',
          '@applitools/eyes-testcafe',
          '@applitools/eyes-webdriverio4-service',
          '@applitools/eyes-webdriverio5-service',
          '@applitools/fancy',
          'applitools-for-selenium-ide',
        ],
      ],
      tree,
    )
  })
  it('can filter by package name', () => {
    const {tree, packages} = makeDependencyTree(
      makePackagesList(path.join(__dirname, 'fixtures', 'packages')),
    )
    assert.deepStrictEqual(
      filterDependencyTreeByPackageName('@applitools/snippets', {tree, packages}),
      [
        ['@applitools/snippets'],
        ['@applitools/driver', '@applitools/screenshoter'],
        ['@applitools/eyes-sdk-core'],
        ['@applitools/visual-grid-client'],
        ['@applitools/eyes-universal', '@applitools/eyes-webdriverio', '@applitools/eyes-images'],
        [
          'eyes-browser-extension',
          '@applitools/eyes-cypress',
          '@applitools/eyes-nightwatch',
          '@applitools/eyes-playwright',
          '@applitools/eyes-playwright-universal',
          '@applitools/eyes-protractor',
          '@applitools/eyes-puppeteer',
          '@applitools/eyes-selenium',
          '@applitools/eyes-selenium-universal',
          '@applitools/eyes-storybook',
          '@applitools/eyes-testcafe',
          '@applitools/eyes-webdriverio5-service',
          'applitools-for-selenium-ide',
        ],
      ],
    )
    assert.deepStrictEqual(
      filterDependencyTreeByPackageName('@applitools/eyes-sdk-core', {tree, packages}),
      [
        ['@applitools/eyes-sdk-core'],
        ['@applitools/visual-grid-client'],
        ['@applitools/eyes-universal', '@applitools/eyes-webdriverio', '@applitools/eyes-images'],
        [
          'eyes-browser-extension',
          '@applitools/eyes-cypress',
          '@applitools/eyes-nightwatch',
          '@applitools/eyes-playwright',
          '@applitools/eyes-playwright-universal',
          '@applitools/eyes-protractor',
          '@applitools/eyes-puppeteer',
          '@applitools/eyes-selenium',
          '@applitools/eyes-selenium-universal',
          '@applitools/eyes-storybook',
          '@applitools/eyes-testcafe',
          '@applitools/eyes-webdriverio5-service',
          'applitools-for-selenium-ide',
        ],
      ],
    )
  })
  it.skip('filter by package name, include dev deps', () => {
    const {tree, packages} = makeDependencyTree(
      makePackagesList(path.join(__dirname, 'fixtures', 'packages')),
    )
    assert.deepStrictEqual(
      filterDependencyTreeByPackageName('@applitools/types', {tree, packages, withDevDeps: true}),
      [
        ['@applitools/types'],
        ['@applitools/driver'],
        ['@applitools/screenshoter'],
        ['@applitools/eyes-sdk-core'],
        [
          '@applitools/visual-grid-client',
          '@applitools/eyes-api',
          '@applitools/spec-driver-webdriverio',
        ],
        [
          '@applitools/eyes-universal',
          '@applitools/spec-driver-playwright',
          '@applitools/spec-driver-puppeteer',
          '@applitools/spec-driver-selenium',
          '@applitools/eyes-webdriverio',
          '@applitools/eyes-images',
        ],
        [
          'eyes-browser-extension',
          '@applitools/eyes-cypress',
          '@applitools/eyes-nightwatch',
          '@applitools/eyes-playwright',
          '@applitools/eyes-playwright-universal',
          '@applitools/eyes-protractor',
          '@applitools/eyes-puppeteer',
          '@applitools/eyes-selenium',
          '@applitools/eyes-selenium-universal',
          '@applitools/eyes-storybook',
          '@applitools/eyes-testcafe',
          '@applitools/eyes-webdriverio5-service',
          '@applitools/fancy',
          'applitools-for-selenium-ide',
        ],
      ],
    )
  })
})
