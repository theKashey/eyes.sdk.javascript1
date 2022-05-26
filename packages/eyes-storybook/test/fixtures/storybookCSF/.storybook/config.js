import { configure, addParameters } from '@storybook/react';

addParameters({
  options: {
    name: 'Storybook config',
    goFullScreen: true,
    showAddonsPanel: true,
    showSearchBox: false,
    addonPanelInRight: true,
    sortStoriesByKind: false,
    hierarchySeparator: /\./,
    hierarchyRootSeparator: /\|/,
    enableShortcuts: true,
    layout: 'centered',
  },
});

function loadStories() {
  // put welcome screen at the top of the list so it's the first one displayed
  require('../stories/LoginFormForOldVersions');

  // automatically import all story js files that end with *.stories.js
  // const req = require.context('../src/stories', true, /\.stories\.js$/);
  // req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
