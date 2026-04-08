import { IPublicClientApplication } from '@azure/msal-browser';
import * as msalApiClient from '../utils/msalApiClient';
import { User } from '../types/user';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function getAllUsers(msalInstance: IPublicClientApplication): Promise<User[]> {
  return msalApiClient.get<User[]>(msalInstance, `${API_BASE}/api/users`);
}

export async function deductPoints(
  msalInstance: IPublicClientApplication,
  userId: string,
  points: number
): Promise<boolean> {
  // POST to a dedicated endpoint to deduct points
  try {
    await msalApiClient.post(msalInstance, `${API_BASE}/api/users/${userId}/deduct`, { points });
    return true;
  } catch (err) {
    return false;
  }
}

export async function addReceivedPoints(
  msalInstance: IPublicClientApplication,
  userId: string,
  points: number
): Promise<boolean> {
  try {
    await msalApiClient.post(msalInstance, `${API_BASE}/api/users/${userId}/received`, { points });
    return true;
  } catch (err) {
    return false;
  }
}

export async function resetMonthlyPoints(msalInstance: IPublicClientApplication): Promise<boolean> {
  try {
    await msalApiClient.post(msalInstance, `${API_BASE}/api/users/reset-monthly`);
    return true;
  } catch (err) {
    return false;
  }
}
