import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { CheerDTO } from '../../types/cheer';
import { CheerCard } from './CheerCard';
import * as cheerService from '../../services/cheerService';
import { Spinner, Button, Alert } from '../ui';

export const CheerFeed: React.FC = () => {
  const { instance } = useMsal();
  const [cheers, setCheers] = useState<CheerDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const take = 20;

  const loadCheers = async (skipCount: number, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const newCheers = await cheerService.getFeed(instance, skipCount, take);
      
      if (newCheers.length < take) {
        setHasMore(false);
      }

      if (append) {
        setCheers(prev => [...prev, ...newCheers]);
      } else {
        setCheers(newCheers);
      }
    } catch (err) {
      setError('Failed to load cheers. Please try again.');
      console.error('Error loading cheers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheers(0);
  }, []);

  const handleLoadMore = () => {
    const newSkip = skip + take;
    setSkip(newSkip);
    loadCheers(newSkip, true);
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
      <h1 className="text-3xl font-bold text-slate-100 mb-6">Cheers Feed</h1>
      
      {cheers.length === 0 ? (
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center">
          <p className="text-slate-300">No cheers yet. Be the first to send one!</p>
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
