import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as msalApiClient from '../utils/msalApiClient';
import { createMockMsalInstance } from '../test/msalMocks';
import {
  addReceivedPoints,
  deductPoints,
  getAllUsers,
  resetMonthlyPoints,
} from '../services/userService';

vi.mock('../utils/msalApiClient', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

describe('userService', () => {
  const msalInstance = createMockMsalInstance() as never;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(msalApiClient.get).mockResolvedValue([] as never);
    vi.mocked(msalApiClient.post).mockResolvedValue({} as never);
  });

  it('getAllUsers fetches the users endpoint', async () => {
    await getAllUsers(msalInstance);

    expect(msalApiClient.get).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/users'
    );
  });

  it('deductPoints returns true after a successful API request', async () => {
    const result = await deductPoints(msalInstance, 'user-123', 10);

    expect(result).toBe(true);
    expect(msalApiClient.post).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/users/user-123/deduct',
      { points: 10 }
    );
  });

  it('deductPoints returns false when the API request fails', async () => {
    vi.mocked(msalApiClient.post).mockRejectedValueOnce(new Error('nope'));

    await expect(deductPoints(msalInstance, 'user-123', 10)).resolves.toBe(false);
  });

  it('addReceivedPoints returns true after a successful API request', async () => {
    const result = await addReceivedPoints(msalInstance, 'user-123', 5);

    expect(result).toBe(true);
    expect(msalApiClient.post).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/users/user-123/received',
      { points: 5 }
    );
  });

  it('addReceivedPoints returns false when the API request fails', async () => {
    vi.mocked(msalApiClient.post).mockRejectedValueOnce(new Error('nope'));

    await expect(addReceivedPoints(msalInstance, 'user-123', 5)).resolves.toBe(false);
  });

  it('resetMonthlyPoints posts to the reset endpoint and returns true on success', async () => {
    const result = await resetMonthlyPoints(msalInstance);

    expect(result).toBe(true);
    expect(msalApiClient.post).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/users/reset-monthly'
    );
  });

  it('resetMonthlyPoints returns false when the API request fails', async () => {
    vi.mocked(msalApiClient.post).mockRejectedValueOnce(new Error('nope'));

    await expect(resetMonthlyPoints(msalInstance)).resolves.toBe(false);
  });
});