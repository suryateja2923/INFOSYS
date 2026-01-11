import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Planner from './Planner';
import * as api from '../services/api';

jest.mock('../services/api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Planner page', () => {
  beforeEach(() => {
    localStorage.setItem('userEmail', 'test@example.com');
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders form when no saved plan exists and can generate a plan', async () => {
    api.getSavedFitnessPlan.mockResolvedValue(null);
    api.generateFitnessPlan.mockResolvedValue({ summary: 'New Plan' });

    render(
      <MemoryRouter>
        <Planner />
      </MemoryRouter>
    );

    // Form should be visible
    expect(screen.getByPlaceholderText('Age')).toBeInTheDocument();

    // Fill and submit form
    fireEvent.change(screen.getByPlaceholderText('Age'), { target: { value: '30' } });
    fireEvent.change(screen.getByPlaceholderText('Height (cm)'), { target: { value: '180' } });
    fireEvent.change(screen.getByPlaceholderText('Weight (kg)'), { target: { value: '80' } });
    fireEvent.click(screen.getByRole('button', { name: /Generate Plan/i }));

    await waitForElementToBeRemoved(() => screen.getByText('Generating...'));
    
    expect(await screen.findByText('New Plan')).toBeInTheDocument();
  });

  test('renders saved plan when it exists', async () => {
    api.getSavedFitnessPlan.mockResolvedValue({ summary: 'Saved Plan' });

    render(
      <MemoryRouter>
        <Planner />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Saved Plan')).toBeInTheDocument();
    });
    
    // Form should not be visible
    expect(screen.queryByPlaceholderText('Age')).not.toBeInTheDocument();
  });
});