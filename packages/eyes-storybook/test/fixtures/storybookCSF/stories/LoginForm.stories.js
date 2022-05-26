import React from 'react';
import { within, userEvent } from '@storybook/testing-library';

import { LoginForm } from './LoginForm';

// Function to emulate pausing between interactions
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const clickSubmitDelay = 1000;
const sbVersion = process.env.STORYBOOK_VERSION || 'latest';
const isInteractionsCompetiable = sbVersion === 'latest' || sbVersion === 'next' || (parseFloat(sbVersion) >= 6.4);
const excludeStories = isInteractionsCompetiable ? [] : ['FilledForm']
export default {
  title: 'Examples/Login',
  component: LoginForm,
  excludeStories,
  args: {
    clickSubmitDelay,
    sbVersion,
  },
};
const Template = (args) => <LoginForm {...args} />;
export const EmptyForm = Template.bind({});
export const FilledForm = Template.bind({});
if (isInteractionsCompetiable){
  FilledForm.play = async ({ canvasElement }) => {
    // Starts querying the component from its root element
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByTestId('email'), 'email@example.com', {
      delay: 100,
    });
    await userEvent.type(canvas.getByTestId('password'), '12345678', {
      delay: 100,
    });
    await sleep(clickSubmitDelay);
    // See https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args to learn how to setup logging in the Actions panel
    await userEvent.click(canvas.getByRole('button'));
  };
}

