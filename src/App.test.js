import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the landing page by default', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', { level: 1 });
  expect(headingElement).toHaveTextContent('AI Powered Fitness Planner');
});
