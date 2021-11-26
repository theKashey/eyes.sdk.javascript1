'use strict';
const getIframeUrl = require('./getIframeUrl');

function getStoryUrl({name, kind, parameters}, baseUrl) {
  const queryParam = parameters && parameters.eyes && parameters.eyes.queryParam;
  const queryParamString = queryParam ? `&${queryParam.name}=${queryParam.value}` : '';

  return `${getIframeUrl(baseUrl)}&selectedKind=${encodeURIComponent(
    kind,
  )}&selectedStory=${encodeURIComponent(name)}${queryParamString}`;
}

module.exports = getStoryUrl;
