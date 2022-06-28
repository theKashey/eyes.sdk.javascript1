import React, { useState } from 'react';
import { Button } from './Button';
import './login.css';

export const LoginForm = ({ onLogin = () => { }, clickSubmitDelay, sbVersion }) => {
  const [clicked, setClicked] = useState(false);
  return <section>
      <h2>Login Form</h2>
      <p>
        Email
      </p>
      <p>
      <input type='text' data-testid='email' id='email' label='email' placeholder='your email' />
      </p>
      <p>
        Password
      </p>
      <p>
        <input type='text' data-testid='password' id='password' label='password' placeholder='your password' />
      </p>
      <p style={{textAlign: 'right'}}>
        <Button size="small" primary={true} onClick={() => setClicked(true)} id="submit" label="Submit" />
      </p>
      <p style={{minHeight: '30px'}}>{clicked && `Submit button was clicked after ${clickSubmitDelay}ms`}</p>
    <p style={{ minHeight: '30px' }}>Storybook version: {sbVersion}</p>
    </section>
}

