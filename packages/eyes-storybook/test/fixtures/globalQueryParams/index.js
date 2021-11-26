import React from 'react';
import { storiesOf } from '@storybook/react';

const global = new URL(window.location).searchParams.get('global');
document.documentElement.setAttribute('global', global || '')

storiesOf('Global query params', module)
  .add('story 1', () => {
    const global = document.documentElement.getAttribute('global');
    const context = global ? Object.fromEntries(global.split(';').map(entry => entry.split(':'))) : {theme: 'light', lang: 'en'}
    return (
      <div style={{ textAlign: 'center', ...(context.theme === 'dark' ? {backgroundColor: 'black', color: 'white'} : {backgroundColor: 'white', color: 'black'})}}>
        <h1>Story 1</h1>
        {context.lang === 'en' ? 'English' : context.lang === 'uk' ? 'Українська' : ''}
      </div>
    )
  })
  .add('story 2', () => {
    const global = document.documentElement.getAttribute('global');
    const context = global ? Object.fromEntries(global.split(';').map(entry => entry.split(':'))) : {theme: 'light', lang: 'en'}
    return (
      <div style={{ textAlign: 'center', ...(context.theme === 'dark' ? {backgroundColor: 'black', color: 'white'} : {backgroundColor: 'white', color: 'black'})}}>
        <h1>Story 2</h1>
        {context.lang === 'en' ? 'English' : context.lang === 'uk' ? 'Українська' : ''}
      </div>
    )
  })