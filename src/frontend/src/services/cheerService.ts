import { IPublicClientApplication } from '@azure/msal-browser';
import * as msalApiClient from '../utils/msalApiClient';
import { CheerDTO, CreateCheerRequest } from '../types/cheer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Create a new cheer
 */
export async function createCheer(
  msalInstance: IPublicClientApplication,
  request: CreateCheerRequest
): Promise<CheerDTO> {
  return msalApiClient.post<CheerDTO>(
    msalInstance,
    `${API_BASE_URL}/api/cheers`,
    request
  );
}

/**
 * Get the public feed of all cheers
 */
export async function getFeed(
  msalInstance: IPublicClientApplication,
  skip: number = 0,
  take: number = 20
): Promise<CheerDTO[]> {
  return msalApiClient.get<CheerDTO[]>(
    msalInstance,
    `${API_BASE_URL}/api/cheers?skip=${skip}&take=${take}`
  );
}

/**
 * Get all cheers sent by the authenticated user
 */
export async function getCheersSent(
  msalInstance: IPublicClientApplication,
  skip: number = 0,
  take: number = 20
): Promise<CheerDTO[]> {
  return msalApiClient.get<CheerDTO[]>(
    msalInstance,
    `${API_BASE_URL}/api/cheers/sent?skip=${skip}&take=${take}`
  );
}

/**
 * Get all cheers received by the authenticated user
 */
export async function getCheersReceived(
  msalInstance: IPublicClientApplication,
  skip: number = 0,
  take: number = 20
): Promise<CheerDTO[]> {
  return msalApiClient.get<CheerDTO[]>(
    msalInstance,
    `${API_BASE_URL}/api/cheers/received?skip=${skip}&take=${take}`
  );
}

/**
 * Get a specific cheer by ID
 */
export async function getCheerById(
  msalInstance: IPublicClientApplication,
  id: string
): Promise<CheerDTO> {
  return msalApiClient.get<CheerDTO>(
    msalInstance,
    `${API_BASE_URL}/api/cheers/${id}`
  );
}

