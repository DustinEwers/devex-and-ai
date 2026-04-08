import React from 'react';
import { createRoot } from 'react-dom/client';
import { PublicClientApplication, EventType, EventMessage, AuthenticationResult } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import App from './App';
import './index.css';
import { msalConfig, validateAuthConfig } from './authConfig';

// Validate configuration before initializing
try {
  validateAuthConfig();
} catch (error) {
  console.error('Authentication configuration error:', error);
  // In production, you might want to show a user-friendly error page
}

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Account selection logic (optional)
// This handles the case where there are multiple accounts
const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

// Listen for sign-in events to set active account
msalInstance.addEventCallback((event: EventMessage) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as AuthenticationResult;
    const account = payload.account;
    msalInstance.setActiveAccount(account);
  }
});

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </React.StrictMode>
);
