import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/ui/Button';

test('renders and triggers click event', () => {
  const handleClick = jest.fn();
  render(<Button label="Click Me" onClick={handleClick} />);

  const button = screen.getByText('Click Me');
  fireEvent.click(button);

  expect(handleClick).toHaveBeenCalledTimes(1);
});
