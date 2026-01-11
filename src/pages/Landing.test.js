import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from './Landing';

test('renders landing page with hero title and button', () => {
  render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  );

  const headingElement = screen.getByRole('heading', { level: 1 });
  expect(headingElement).toHaveTextContent(/AI Powered Fitness Planner/i);

  const buttonElement = screen.getByRole('button', { name: /Get Started/i });
  expect(buttonElement).toBeInTheDocument();
});
