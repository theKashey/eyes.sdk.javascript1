const getClientAPI = require('./getClientAPI');

async function renderStoryWithClientAPI(index) {
  let api;
  try {
    api = getClientAPI();
    await api.selectStory(index);
  } catch (ex) {
    return {message: ex.message, version: api ? api.version : undefined};
  }
}

module.exports = renderStoryWithClientAPI;
