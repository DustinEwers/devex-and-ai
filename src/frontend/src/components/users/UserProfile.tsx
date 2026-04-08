import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useUser } from '../../contexts/UserContext';
import { CheerCard } from '../cheers/CheerCard';
import { CheerDTO } from '../../types/cheer';
import * as cheerService from '../../services/cheerService';
import { Card, Button, Spinner } from '../ui';

export default function UserProfile() {
  const { instance } = useMsal();
  const { user, syncUser, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [cheersSent, setCheersSent] = useState<CheerDTO[]>([]);
  const [cheersReceived, setCheersReceived] = useState<CheerDTO[]>([]);
  const [loadingCheers, setLoadingCheers] = useState(true);

  useEffect(() => {
    loadCheers();
  }, [activeTab]);

  const loadCheers = async () => {
    if (!user) return;
    
    try {
      setLoadingCheers(true);
      if (activeTab === 'sent') {
        const cheers = await cheerService.getCheersSent(instance, 0, 20);
        setCheersSent(cheers);
      } else {
        const cheers = await cheerService.getCheersReceived(instance, 0, 20);
        setCheersReceived(cheers);
      }
    } catch (err) {
      console.error('Error loading cheers:', err);
    } finally {
      setLoadingCheers(false);
    }
  };

  if (!user) return null;

  const currentCheers = activeTab === 'sent' ? cheersSent : cheersReceived;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-100 mb-6">My Profile</h1>

      {/* Points Available Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-200 mb-1">Available to Spend</p>
            <div className="flex items-center gap-3">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <span className="text-6xl font-bold text-white">{user.pointsReceived}</span>
            </div>
            <p className="text-sm text-purple-200 mt-2">Redeem your points for awesome rewards!</p>
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('navigateToStore'));
            }}
            className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-lg hover:bg-purple-50 transition-colors shadow-lg"
          >
            Visit Store
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg p-6 border border-blue-500/20 shadow-lg">
          <p className="text-sm font-medium text-blue-300 mb-2">Points to Give</p>
          <p className="text-5xl font-bold text-blue-400">{user.pointsToGive}</p>
          <p className="text-xs text-blue-400/70 mt-2">Resets monthly</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-lg p-6 border border-amber-500/20 shadow-lg">
          <p className="text-sm font-medium text-amber-300 mb-2">Points Received</p>
          <p className="text-5xl font-bold text-amber-400">{user.pointsReceived}</p>
          <p className="text-xs text-amber-400/70 mt-2">Total accumulated</p>
        </div>
      </div>

      {/* User Info */}
      <Card className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-slate-100 mb-2">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-slate-300">{user.email}</p>
          </div>
          <Button
            onClick={syncUser}
            disabled={isLoading}
            variant="secondary"
          >
            {isLoading ? 'Syncing...' : 'Refresh Profile'}
          </Button>
        </div>
      </Card>

      {/* Cheers Tabs */}
      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-slate-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('received')}
              className={`py-4 px-6 font-medium text-sm transition-all ${
                activeTab === 'received'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-slate-400 hover:text-slate-300 hover:border-b-2 hover:border-slate-600'
              }`}
            >
              Cheers Received
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-6 font-medium text-sm transition-all ${
                activeTab === 'sent'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-slate-400 hover:text-slate-300 hover:border-b-2 hover:border-slate-600'
              }`}
            >
              Cheers Sent
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loadingCheers ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="md" color="blue" />
              <span className="ml-3 text-slate-300">Loading...</span>
            </div>
          ) : currentCheers.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              No cheers {activeTab === 'sent' ? 'sent' : 'received'} yet.
            </div>
          ) : (
            <div className="space-y-4">
              {currentCheers.map(cheer => (
                <CheerCard key={cheer.id} cheer={cheer} />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
