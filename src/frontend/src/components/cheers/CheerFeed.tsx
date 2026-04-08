import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { CheerDTO, FeedFilterMode, FeedQueryOptions } from '../../types/cheer';
import { useAuth } from '../../contexts/AuthContext';
import { CheerCard } from './CheerCard';
import * as cheerService from '../../services/cheerService';
import { Spinner, Button, Alert, Select } from '../ui';

const DEFAULT_FEED_QUERY: FeedQueryOptions = {
  sortBy: 'createdAt',
  sortDir: 'desc',
  filterMode: 'all',
};

const HERO_IMAGE_URL = import.meta.env.VITE_CHEER_FEED_HERO_IMAGE_URL || '/cheer-feed-hero.svg';

const sortControlOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highestPoints', label: 'Highest points first' },
  { value: 'lowestPoints', label: 'Lowest points first' },
];

const filterControlOptions = [
  { value: 'all', label: 'All cheers' },
  { value: 'directedAtMe', label: 'Directed at me' },
];

function parseFeedQueryFromUrl(): FeedQueryOptions {
  const query = new URLSearchParams(window.location.search);
  const sortBy = query.get('sortBy');
  const sortDir = query.get('sortDir');
  const filterMode = query.get('filterMode');

  const validSortBy = sortBy === 'createdAt' || sortBy === 'points' ? sortBy : DEFAULT_FEED_QUERY.sortBy;
  const validSortDir = sortDir === 'asc' || sortDir === 'desc' ? sortDir : DEFAULT_FEED_QUERY.sortDir;
  const validFilterMode = filterMode === 'all' || filterMode === 'directedAtMe' ? filterMode : DEFAULT_FEED_QUERY.filterMode;

  return {
    sortBy: validSortBy,
    sortDir: validSortDir,
    filterMode: validFilterMode,
  };
}

function writeFeedQueryToUrl(feedQuery: FeedQueryOptions): void {
  const params = new URLSearchParams(window.location.search);
  params.set('sortBy', feedQuery.sortBy);
  params.set('sortDir', feedQuery.sortDir);
  params.set('filterMode', feedQuery.filterMode);

  const newSearch = params.toString();
  const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
  window.history.replaceState({}, '', newUrl);
}

function getSortControlValue(feedQuery: FeedQueryOptions): string {
  if (feedQuery.sortBy === 'createdAt' && feedQuery.sortDir === 'desc') {
    return 'newest';
  }

  if (feedQuery.sortBy === 'createdAt' && feedQuery.sortDir === 'asc') {
    return 'oldest';
  }

  if (feedQuery.sortBy === 'points' && feedQuery.sortDir === 'desc') {
    return 'highestPoints';
  }

  return 'lowestPoints';
}

function mapSortControlValue(sortValue: string): Pick<FeedQueryOptions, 'sortBy' | 'sortDir'> {
  switch (sortValue) {
    case 'oldest':
      return { sortBy: 'createdAt', sortDir: 'asc' };
    case 'highestPoints':
      return { sortBy: 'points', sortDir: 'desc' };
    case 'lowestPoints':
      return { sortBy: 'points', sortDir: 'asc' };
    case 'newest':
    default:
      return { sortBy: 'createdAt', sortDir: 'desc' };
  }
}

function sortCheersForQuery(cheers: CheerDTO[], query: FeedQueryOptions): CheerDTO[] {
  const sorted = [...cheers];

  sorted.sort((a, b) => {
    const direction = query.sortDir === 'asc' ? 1 : -1;

    if (query.sortBy === 'points') {
      const pointsA = a.pointsPerRecipient * a.recipients.length;
      const pointsB = b.pointsPerRecipient * b.recipients.length;

      if (pointsA !== pointsB) {
        return (pointsA - pointsB) * direction;
      }
    } else {
      const createdAtA = new Date(a.createdAt).getTime();
      const createdAtB = new Date(b.createdAt).getTime();

      if (createdAtA !== createdAtB) {
        return (createdAtA - createdAtB) * direction;
      }
    }

    const fallbackA = new Date(a.createdAt).getTime();
    const fallbackB = new Date(b.createdAt).getTime();
    return (fallbackB - fallbackA);
  });

  return sorted;
}

function filterCheersForQuery(
  cheers: CheerDTO[],
  query: FeedQueryOptions,
  currentUserEmail: string | null
): CheerDTO[] {
  if (query.filterMode !== 'directedAtMe') {
    return cheers;
  }

  if (!currentUserEmail) {
    return [];
  }

  return cheers.filter((cheer) =>
    cheer.recipients.some((recipient) =>
      recipient.recipientEmail?.toLowerCase() === currentUserEmail
    )
  );
}

export const CheerFeed: React.FC = () => {
  const { instance } = useMsal();
  const { user: authUser } = useAuth();
  const [cheers, setCheers] = useState<CheerDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [feedQuery, setFeedQuery] = useState<FeedQueryOptions>(() => parseFeedQueryFromUrl());
  const [heroImageAvailable, setHeroImageAvailable] = useState(true);
  const take = 20;
  const currentUserEmail = authUser?.email?.toLowerCase() || null;

  const loadCheers = async (skipCount: number, query: FeedQueryOptions, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const newCheers = await cheerService.getFeed(instance, skipCount, take, query);
      
      if (newCheers.length < take) {
        setHasMore(false);
      } else if (skipCount === 0) {
        setHasMore(true);
      }

      if (append) {
        setCheers((prev) => {
          const mergedCheers = [...prev, ...newCheers];
          const filteredCheers = filterCheersForQuery(mergedCheers, query, currentUserEmail);
          return sortCheersForQuery(filteredCheers, query);
        });
      } else {
        const filteredCheers = filterCheersForQuery(newCheers, query, currentUserEmail);
        setCheers(sortCheersForQuery(filteredCheers, query));
      }
    } catch (err) {
      setError('Failed to load cheers. Please try again.');
      console.error('Error loading cheers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSkip(0);
    setHasMore(true);
    writeFeedQueryToUrl(feedQuery);
    loadCheers(0, feedQuery);
  }, [feedQuery, currentUserEmail]);

  const handleLoadMore = () => {
    const newSkip = skip + take;
    setSkip(newSkip);
    loadCheers(newSkip, feedQuery, true);
  };

  const handleSortChange = (value: string) => {
    const nextSort = mapSortControlValue(value);
    setFeedQuery((prev) => ({ ...prev, ...nextSort }));
  };

  const handleFilterChange = (value: string) => {
    setFeedQuery((prev) => ({ ...prev, filterMode: value as FeedFilterMode }));
  };

  const handleReset = () => {
    setFeedQuery(DEFAULT_FEED_QUERY);
  };

  if (loading && cheers.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="md" color="blue" />
        <span className="ml-3 text-slate-300">Loading cheers...</span>
      </div>
    );
  }

  if (error && cheers.length === 0) {
    return (
      <Alert variant="error">{error}</Alert>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 rounded-xl border border-slate-700 overflow-hidden">
        <div className="relative min-h-36">
          {heroImageAvailable && (
            <img
              src={HERO_IMAGE_URL}
              alt="People celebrating recognition together"
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setHeroImageAvailable(false)}
            />
          )}
          <div className={`absolute inset-0 ${heroImageAvailable ? 'bg-slate-900/65' : 'bg-slate-800'}`} />
          <div className="relative p-5">
            <h1 className="text-2xl font-bold text-slate-100">Cheers Feed</h1>
            <p className="text-sm text-slate-300 mt-1">
              See the latest recognition moments across your workplace.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 border border-slate-700 bg-slate-800 rounded-lg p-3">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <Select
            label="Sort by"
            value={getSortControlValue(feedQuery)}
            onChange={handleSortChange}
            options={sortControlOptions}
            className="mb-0"
          />
          <Select
            label="Filter"
            value={feedQuery.filterMode}
            onChange={handleFilterChange}
            options={filterControlOptions}
            className="mb-0"
          />
          <Button variant="secondary" size="sm" onClick={handleReset} className="h-[44px]">
            Reset
          </Button>
        </div>
      </div>
      
      {cheers.length === 0 ? (
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center">
          <p className="text-slate-300">
            {feedQuery.filterMode === 'directedAtMe'
              ? 'No cheers are currently directed at you.'
              : 'No cheers yet. Be the first to send one!'}
          </p>
        </div>
      ) : (
        <>
          {cheers.map(cheer => (
            <CheerCard key={cheer.id} cheer={cheer} />
          ))}

          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="primary"
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
