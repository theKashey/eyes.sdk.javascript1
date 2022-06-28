'use strict'
const FakeEyesWrapper = require('./FakeEyesWrapper')

function createFakeWrapper(baseUrl, {empty, ...options} = {}) {
  return new FakeEyesWrapper(
    Object.assign(
      empty
        ? {}
        : {
            goodFilename: 'test.dom.json',
            goodResourceUrls: [`${baseUrl}/smurfs.jpg`, `${baseUrl}/test.css`],
            goodTags: ['good1', 'good2'],
          },
      options,
    ),
  )
}

module.exports = createFakeWrapper
