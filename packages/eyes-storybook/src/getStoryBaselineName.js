'use strict';
const getStoryTitle = require('./getStoryTitle');

function getStoryBaselineName({name, kind, parameters}) {
  const storyTitle = getStoryTitle({name, kind, parameters});
  const queryParam = parameters && parameters.eyes && parameters.eyes.queryParam;

  if (!queryParam || queryParam.name === 'eyes-variation') return storyTitle;

  return `${storyTitle} [${queryParam.name}=${queryParam.value}]`;
}

module.exports = getStoryBaselineName;
