import { render, screen, fireEvent } from '@testing-library/react';
import AuthModal from './AuthModal';

describe('AuthModal', () => {
  const handleClose = jest.fn();
  const handleSuccess = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    handleClose.mockClear();
    handleSuccess.mockClear();
  });

  test('renders login form by default and can switch to signup', () => {
    render(<AuthModal onClose={handleClose} onSuccess={handleSuccess} />);

    // Check for login form elements
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();

    // Switch to signup mode
    const createAccountSpan = screen.getByText(/Create account/i);
    fireEvent.click(createAccountSpan);

    // Check for signup form elements
    expect(screen.getByRole('button', { name: /Signup/i })).toBeInTheDocument();
  });
});
