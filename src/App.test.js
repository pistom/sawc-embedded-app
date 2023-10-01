import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const title = screen.getByTestId("app-logo");
  expect(title).toHaveTextContent("Smart Automatic Watering Controller");
});

test('page title is correct', () => {
  render(<App />);
  expect(document.title).toBe("Smart Automatic Watering Controller");
});
