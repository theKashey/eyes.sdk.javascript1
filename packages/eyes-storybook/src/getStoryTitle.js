'use strict';

function getStoryTitle({name, kind, parameters}) {
  const queryParam = parameters && parameters.eyes && parameters.eyes.queryParam;
  const variation =
    queryParam && queryParam.name === 'eyes-variation' ? queryParam.value : undefined;

  return `${kind}: ${name}${variation ? ` [${variation}]` : ''}`;
}

module.exports = getStoryTitle;
