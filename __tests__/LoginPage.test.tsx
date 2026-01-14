/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form with username and password fields', () => {
      renderLoginPage();
      
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should display company branding', () => {
      renderLoginPage();
      
      expect(screen.getByText(/union bank/i)).toBeInTheDocument();
      expect(screen.getByText(/data analytics portal/i)).toBeInTheDocument();
    });

    it('should show demo credentials information', () => {
      renderLoginPage();
      
      expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when submitting empty form', async () => {
      renderLoginPage();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter both username and password/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid credentials', async () => {
      renderLoginPage();
      
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await userEvent.type(usernameInput, 'wronguser');
      await userEvent.type(passwordInput, 'wrongpass');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Flow', () => {
    it('should navigate to dashboard on successful login with admin credentials', async () => {
      renderLoginPage();
      
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await userEvent.type(usernameInput, 'admin');
      await userEvent.type(passwordInput, 'admin123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should navigate to dashboard on successful login with user credentials', async () => {
      renderLoginPage();
      
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await userEvent.type(usernameInput, 'user');
      await userEvent.type(passwordInput, 'user123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderLoginPage();
      
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });
});
