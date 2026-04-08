import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as cheerService from '../services/cheerService';
import * as msalApiClient from '../utils/msalApiClient';

vi.mock('../utils/msalApiClient', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

describe('cheerService.getFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(msalApiClient.get).mockResolvedValue([]);
  });

  it('uses default sort and filter query values', async () => {
    await cheerService.getFeed({} as any);

    expect(msalApiClient.get).toHaveBeenCalledWith(
      expect.anything(),
      'http://localhost:5000/api/cheers?skip=0&take=20&sortBy=createdAt&sortDir=desc&filterMode=all'
    );
  });

  it('passes provided sort and filter options to the API query', async () => {
    await cheerService.getFeed(
      {} as any,
      20,
      10,
      {
        sortBy: 'points',
        sortDir: 'asc',
        filterMode: 'directedAtMe',
      }
    );

    expect(msalApiClient.get).toHaveBeenCalledWith(
      expect.anything(),
      'http://localhost:5000/api/cheers?skip=20&take=10&sortBy=points&sortDir=asc&filterMode=directedAtMe'
    );
  });
});
