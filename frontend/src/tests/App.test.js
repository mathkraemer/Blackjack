// App.test.js
// Basic test setup for frontend components

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../components/App';

test('renders Blackjack title', () => {
  render(<App />);
  const linkElement = screen.getByText(/Blackjack/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders GameBoard component', () => {
  render(<App />);
  const gameBoardElement = screen.getByText(/Player's Hand/i);
  expect(gameBoardElement).toBeInTheDocument();
});