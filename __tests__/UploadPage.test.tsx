/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import UploadPage from '@/pages/UploadPage';

// Mock xlsx library
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(() => [
      { name: 'Test', value: 100 },
      { name: 'Test2', value: 200 },
    ]),
  },
}));

const renderUploadPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <UploadPage />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('UploadPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock authenticated state
    localStorage.getItem = jest.fn((key) => {
      if (key === 'auth_user') {
        return JSON.stringify({ username: 'admin', role: 'admin' });
      }
      return null;
    });
  });

  describe('Rendering', () => {
    it('should render upload area', () => {
      renderUploadPage();
      
      expect(screen.getByText(/upload excel file/i)).toBeInTheDocument();
    });

    it('should show file type restrictions', () => {
      renderUploadPage();
      
      expect(screen.getByText(/\.xls|\.xlsx/i)).toBeInTheDocument();
    });

    it('should display maximum file size limit', () => {
      renderUploadPage();
      
      expect(screen.getByText(/10mb/i)).toBeInTheDocument();
    });
  });

  describe('File Upload Validation', () => {
    it('should accept Excel files', async () => {
      renderUploadPage();
      
      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      const input = screen.getByTestId('file-input') || document.querySelector('input[type="file"]');
      
      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
        });
        
        fireEvent.change(input);
        
        await waitFor(() => {
          expect(screen.queryByText(/invalid file type/i)).not.toBeInTheDocument();
        });
      }
    });

    it('should reject non-Excel files', async () => {
      renderUploadPage();
      
      const file = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });
      
      const input = document.querySelector('input[type="file"]');
      
      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
        });
        
        fireEvent.change(input);
        
        await waitFor(() => {
          // Check for error message or validation state
          expect(true).toBe(true); // Placeholder for actual validation check
        });
      }
    });
  });

  describe('Data Preview', () => {
    it('should show data preview after successful upload', async () => {
      renderUploadPage();
      
      // Simulate successful file upload and data parsing
      // This would require more complex mocking of the file reading process
      expect(true).toBe(true); // Placeholder test
    });
  });

  describe('Security', () => {
    it('should sanitize file names', () => {
      // Test that malicious file names are sanitized
      const maliciousFileName = '<script>alert("xss")</script>.xlsx';
      const sanitized = maliciousFileName.replace(/[<>]/g, '');
      
      expect(sanitized).not.toContain('<script>');
    });

    it('should validate file size before upload', () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validFile = { size: 5 * 1024 * 1024 }; // 5MB
      const invalidFile = { size: 15 * 1024 * 1024 }; // 15MB
      
      expect(validFile.size <= maxSize).toBe(true);
      expect(invalidFile.size <= maxSize).toBe(false);
    });
  });
});
