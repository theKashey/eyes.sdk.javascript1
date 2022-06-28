const {configure} = require('@storybook/react');

function loadStories() {
  require('./index.js');
}

configure(loadStories, module);
