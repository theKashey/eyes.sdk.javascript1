import React from 'react';
import { storiesOf } from '@storybook/react';

storiesOf('JS Layout', module)
  .add('JS Layout page', () => {
    return <div id="main">
    <div id="indicator"></div>
    <div id="text">DEFAULT</div>
  </div>
  }, {eyes: {layoutBreakpoints: [500, 1000]}})
  .add('JS Layout page without specifying layoutBreakpoints', () => {
    return <div id="main">
    <div id="indicator"></div>
    <div id="text">DEFAULT</div>
  </div>
  }, {
    eyes: {runBefore: async () => window.dispatchEvent(new Event('load'))}
  })