# Cheersly Frontend

A workplace recognition application built with Vite, React, TypeScript, and Tailwind CSS, featuring Microsoft Entra ID (Azure AD) authentication.

## Features

- **Microsoft Entra Authentication**: Single sign-on (SSO) with automatic token management
- **Modern Stack**: Vite + React 18 + TypeScript + Tailwind CSS
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Testing**: Vitest + React Testing Library for unit and integration tests
- **Secure API Client**: Automatic Bearer token attachment for API requests

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Microsoft Entra ID app registration (see [Authentication Setup](#authentication-setup))

### Installation

```bash
npm install
```

### Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Configure your `.env.local` file with your Azure Entra app details:

```env
# Microsoft Entra ID Configuration
VITE_ENTRA_CLIENT_ID=your-client-id-here
VITE_ENTRA_AUTHORITY=https://login.microsoftonline.com/{tenant-id}/v2.0
VITE_ENTRA_REDIRECT_URI=http://localhost:5173/
VITE_ENTRA_API_SCOPE=api://{api-client-id}/user_impersonation

# Backend API
VITE_API_BASE_URL=http://localhost:5000
```

### Available Scripts

- `npm run dev` - Start development server (default: http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage report

## Authentication Setup

### Azure Entra ID App Registration

1. **Register the Frontend Application**:
   - Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
   - Click "New registration"
   - Name: `Cheersly Frontend`
   - Supported account types: Choose based on your organization
   - Redirect URI: `Single-page application (SPA)` → `http://localhost:5173/`

2. **Configure Authentication**:
   - Under "Authentication", add redirect URIs for all environments
   - Enable "Access tokens" and "ID tokens" under Implicit grant
   - Set logout URL if needed

3. **Configure API Permissions**:
   - Add permissions for the Cheersly API (the scope you'll use)
   - Add Microsoft Graph permissions if needed (e.g., `User.Read`)

4. **Get Configuration Values**:
   - Copy the **Application (client) ID** → `VITE_ENTRA_CLIENT_ID`
   - Copy the **Directory (tenant) ID** → use in `VITE_ENTRA_AUTHORITY`
   - Configure the API scope → `VITE_ENTRA_API_SCOPE`

### Authentication Flow

The application implements a robust authentication flow:

1. **Automatic SSO**: On load, the app attempts silent sign-in if a user session exists
2. **Interactive Sign-In**: If silent SSO fails, users see a sign-in button
3. **Token Management**: Access tokens are automatically acquired and refreshed
4. **API Integration**: All API requests include Bearer tokens automatically

### Using Authentication in Components

```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, signIn, signOut, getAccessToken } = useAuth();

  // Access user information
  console.log(user?.name, user?.email);

  // Make authenticated API calls
  const token = await getAccessToken();
}
```

### Making API Requests

Use the provided API client for authenticated requests:

```typescript
import { createApiClient } from './utils/apiClient';
import { useMsal } from '@azure/msal-react';

function MyComponent() {
  const { instance } = useMsal();
  const apiClient = createApiClient(instance);

  // Make authenticated requests
  const data = await apiClient.get('/api/cheers');
  await apiClient.post('/api/cheers', { message: 'Great job!' });
}
```

## Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication UI components
│   │   ├── SignInButton.tsx
│   │   ├── SignOutButton.tsx
│   │   └── AuthStatus.tsx
│   ├── ErrorBoundary.tsx  # Error boundary for error handling
│   ├── AuthErrorDisplay.tsx
│   └── ProtectedRoute.tsx # Route guard for protected pages
├── contexts/
│   └── AuthContext.tsx    # Authentication context provider
├── types/
│   └── auth.ts           # Authentication type definitions
├── utils/
│   ├── apiClient.ts      # API client with auth
│   └── msalApiClient.ts  # MSAL token utilities
├── test/
│   ├── setup.ts          # Test configuration
│   └── msalMocks.ts      # MSAL test utilities
├── authConfig.ts         # MSAL configuration
├── App.tsx              # Main app component
├── main.tsx             # App entry point
└── vite-env.d.ts        # Vite environment types
```

## Testing

The project uses Vitest and React Testing Library:

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

Test files are located in `src/__tests__/` and follow the naming convention `*.test.ts(x)`.

## Security Considerations

- **Token Storage**: Access tokens are stored in `sessionStorage` (not `localStorage`)
- **No Secrets**: Never commit `.env.local` or store secrets in source code
- **HTTPS Required**: Production deployments must use HTTPS
- **CORS**: Ensure backend API has proper CORS configuration
- **Token Validation**: Backend must validate all tokens

## Troubleshooting

### Silent Sign-In Fails

- **Browser Cookie Blocking**: Some browsers block third-party cookies. The app falls back to interactive sign-in.
- **Solution**: Ensure users click the "Sign In" button

### Token Acquisition Errors

- **Check Scopes**: Ensure `VITE_ENTRA_API_SCOPE` matches the API's exposed scope
- **Check Permissions**: Verify app registration has required API permissions
- **Admin Consent**: Some scopes require admin consent in Azure portal

### 401/403 Errors from API

- **Token Validation**: Ensure backend is configured to validate tokens from your tenant
- **Audience Check**: Verify the API validates the correct audience claim
- **Roles/Claims**: Check if required roles are configured in app registration

## Related Documentation

- [Specification: Frontend Authentication](../spec/spec-infrastructure-frontend-microsoft-entra-auth.md)
- [MSAL React Documentation](https://learn.microsoft.com/azure/active-directory/develop/msal-react)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

## License

Proprietary - Cheersly Application

