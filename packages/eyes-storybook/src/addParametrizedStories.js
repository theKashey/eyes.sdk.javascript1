'use strict';

function addParametrizedStories({stories, config}) {
  const parametrizedStories = {};
  for (const story of stories) {
    const queryParams = getStoryQueryParams(story, config);
    if (!queryParams) continue;
    for (const queryParam of queryParams) {
      const queryParamString = `${queryParam.name}=${queryParam.value}`;
      const parametrizeStoriesArray =
        parametrizedStories[queryParamString] || (parametrizedStories[queryParamString] = []);
      parametrizeStoriesArray.push({
        ...story,
        parameters: addQueryParam(story.parameters, queryParam),
      });
    }
  }

  return Object.values(parametrizedStories).reduce((allStories, parametrizedStories) => {
    return allStories.concat(parametrizedStories);
  }, stories);
}

function getStoryQueryParams(story, config) {
  let queryParams;
  if (story.parameters && story.parameters.eyes && story.parameters.eyes.queryParams) {
    if (!Array.isArray(story.parameters.eyes.queryParams)) {
      throw new Error('queryParams should be an array');
    }
    queryParams = [...story.parameters.eyes.queryParams];
  }
  if (story.parameters && story.parameters.eyes && story.parameters.eyes.variations) {
    if (!Array.isArray(story.parameters.eyes.variations)) {
      throw new Error('variations should be an array');
    }
    queryParams = [
      ...(queryParams || []),
      ...variationsToQueryParams(story.parameters.eyes.variations),
    ];
  }

  if (queryParams) return queryParams;

  if (config.queryParams) {
    if (!Array.isArray(config.queryParams)) {
      throw new Error('global queryParams should be an array');
    }
    queryParams = [...config.queryParams];
  }

  if (config.variations) {
    if (Array.isArray(config.variations)) {
      queryParams = [...(queryParams || []), ...variationsToQueryParams(config.variations)];
    } else if (typeof config.variations === 'function') {
      const variations = config.variations(story);
      if (variations) {
        if (!Array.isArray(variations)) {
          throw new Error('global variations should be a function that returns array');
        }
        queryParams = [...(queryParams || []), ...variationsToQueryParams(variations)];
      }
    } else {
      throw new Error('global variations should be an array or a function that returns array');
    }
  }

  if (queryParams) return queryParams;
}

function variationsToQueryParams(variations) {
  return variations.map(variation => ({name: 'eyes-variation', value: variation}));
}

function addQueryParam(parameters, queryParam) {
  parameters = {...parameters};
  parameters.eyes = {...parameters.eyes};
  parameters.eyes.queryParam = queryParam;
  return parameters;
}

module.exports = addParametrizedStories;
