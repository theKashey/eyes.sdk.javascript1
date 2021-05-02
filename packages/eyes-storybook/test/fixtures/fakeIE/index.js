import React from 'react';
import { storiesOf } from '@storybook/react';

storiesOf('Fake IE', module).add('Fake IE Page', () => {
  return <div style={{ textAlign: 'center' }}>
        <div id="userAgent">
            <h1>User Agent</h1>
            {window.navigator.userAgent}
        </div>
        <div id="docMode">
            <h1>Document Mode</h1>
            {document.documentMode}
        </div>
    </div>
})