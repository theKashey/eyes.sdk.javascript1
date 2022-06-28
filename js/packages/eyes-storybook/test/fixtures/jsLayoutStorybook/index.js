import React from 'react';
import { storiesOf } from '@storybook/react';

storiesOf('JS Layout', module).add('JS Layout page', () => {
  return <div id="main">
  <div id="indicator"></div>
  <div id="text">DEFAULT</div>
</div>
})