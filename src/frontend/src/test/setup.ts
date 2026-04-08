/**
 * Test setup file
 * Configures testing environment and global mocks
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.stubEnv('VITE_ENTRA_CLIENT_ID', 'test-client-id');
vi.stubEnv('VITE_ENTRA_AUTHORITY', 'https://login.microsoftonline.com/test-tenant/v2.0');
vi.stubEnv('VITE_ENTRA_REDIRECT_URI', 'http://localhost:5173/');
vi.stubEnv('VITE_ENTRA_API_SCOPE', 'api://test-api-id/user_impersonation');
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:5000');
