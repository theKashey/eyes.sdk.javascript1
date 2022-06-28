import React from 'react';
import { storiesOf } from '@storybook/react';

storiesOf('WaitBeforeCapture', module).add('WaitBeforeCapture page', () => {
  return <div id="main">
  <div id="indicator"></div>
  <div id="text">DEFAULT</div>
</div>
})