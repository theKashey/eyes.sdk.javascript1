'use strict';
const getIframeUrl = require('./getIframeUrl');

function getStoryUrl({name, kind, parameters}, baseUrl) {
  const queryParams = (parameters && parameters.eyes && parameters.eyes.queryParams) || {};
  const queryString = Object.entries(queryParams).reduce(
    (queryString, [name, value]) => queryString + `&${name}=${value}`,
    '',
  );

  return `${getIframeUrl(baseUrl)}&selectedKind=${encodeURIComponent(
    kind,
  )}&selectedStory=${encodeURIComponent(name)}${queryString}`;
}

module.exports = getStoryUrl;
