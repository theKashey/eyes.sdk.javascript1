import React from 'react';
import { storiesOf } from '@storybook/react';

setTimeout(() => {   
        storiesOf('zeroStories', module)
            .add('first story', () => (
            <div style={{fontSize: '30px'}}>This story came in late</div>
            ), )
},1000);