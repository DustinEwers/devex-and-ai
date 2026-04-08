import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { UserSyncGuard } from './components/UserSyncGuard';
import { SignInButton, UserMenu } from './components/auth';
import { useAuth } from './contexts/AuthContext';
import { useUser } from './contexts/UserContext';
import UserProfile from './components/users/UserProfile';
import { CheerFeed } from './components/cheers/CheerFeed';
import { CreateCheerForm } from './components/cheers/CreateCheerForm';
import { Card, Spinner } from './components/ui';
import StoreCatalog from './components/Store/StoreCatalog';
import StoreItemDetail from './components/Store/StoreItemDetail';
import OrderHistory from './components/Store/OrderHistory';
import RedeemConfirmationModal from './components/Store/RedeemConfirmationModal';
import AdminStoreManagement from './components/Store/AdminStoreManagement';
import { RedeemResponse } from './types/store';

type Tab = 'feed' | 'create' | 'profile' | 'store' | 'admin';
type StoreView = 'catalog' | 'orders' | 'detail';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [storeView, setStoreView] = useState<StoreView>('catalog');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [redemption, setRedemption] = useState<RedeemResponse | null>(null);

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setStoreView('detail');
  };

  const handleBackToCatalog = () => {
    setStoreView('catalog');
    setSelectedItemId(null);
  };

  const handleRedemptionSuccess = (response: RedeemResponse) => {
    setRedemption(response);
  };

  const handleCloseRedemption = () => {
    setRedemption(null);
    setStoreView('catalog');
    setSelectedItemId(null);
  };

  const handleBrowseStore = () => {
    setStoreView('catalog');
  };

  // Listen for navigate to store event from Profile
  useEffect(() => {
    const handleNavigateToStore = () => {
      setActiveTab('store');
      setStoreView('catalog');
    };

    window.addEventListener('navigateToStore', handleNavigateToStore);
    return () => window.removeEventListener('navigateToStore', handleNavigateToStore);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <div className="flex items-center justify-center space-x-3">
            <Spinner size="md" color="blue" />
            <p className="text-lg text-slate-300">Loading...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-blue-400">Cheersly</h1>
              <p className="text-slate-300">Recognition: It's Not Rocket Science.</p>
            </div>
            {isAuthenticated ? <UserMenu /> : <SignInButton />}
          </div>
        </Card>

        {/* Main Content - Only shown when authenticated */}
        {isAuthenticated && (
          <UserSyncGuard>
            {/* Navigation Tabs */}
            <Card className="!p-0 overflow-hidden">
              <div className="border-b border-slate-700">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('feed')}
                    className={`py-4 px-6 font-medium text-sm transition-all ${
                      activeTab === 'feed'
                        ? 'border-b-2 border-blue-500 text-blue-400'
                        : 'text-slate-400 hover:text-slate-300 hover:border-b-2 hover:border-slate-600'
                    }`}
                  >
                    Feed
                  </button>
                  <button
                    onClick={() => setActiveTab('create')}
                    className={`py-4 px-6 font-medium text-sm transition-all ${
                      activeTab === 'create'
                        ? 'border-b-2 border-blue-500 text-blue-400'
                        : 'text-slate-400 hover:text-slate-300 hover:border-b-2 hover:border-slate-600'
                    }`}
                  >
                    Send Cheer
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('store');
                      setStoreView('catalog');
                    }}
                    className={`py-4 px-6 font-medium text-sm transition-all ${
                      activeTab === 'store'
                        ? 'border-b-2 border-blue-500 text-blue-400'
                        : 'text-slate-400 hover:text-slate-300 hover:border-b-2 hover:border-slate-600'
                    }`}
                  >
                    Store
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`py-4 px-6 font-medium text-sm transition-all ${
                      activeTab === 'profile'
                        ? 'border-b-2 border-blue-500 text-blue-400'
                        : 'text-slate-400 hover:text-slate-300 hover:border-b-2 hover:border-slate-600'
                    }`}
                  >
                    Profile
                  </button>
                  {(user?.role === 'Admin' || import.meta.env.DEV) && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={`py-4 px-6 font-medium text-sm transition-all ${
                        activeTab === 'admin'
                          ? 'border-b-2 border-purple-500 text-purple-400'
                          : 'text-slate-400 hover:text-slate-300 hover:border-b-2 hover:border-slate-600'
                      }`}
                    >
                      Admin {import.meta.env.DEV && user?.role !== 'Admin' && '(Dev)'}
                    </button>
                  )}
                  {/* Debug: Show user role in development */}
                  {import.meta.env.DEV && user && (
                    <div className="py-4 px-2 text-xs text-slate-500">
                      Role: {user.role || 'undefined'} | Email: {user.email}
                    </div>
                  )}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'feed' && <CheerFeed />}
                {activeTab === 'create' && (
                  <CreateCheerForm 
                    onSuccess={() => {
                      setActiveTab('feed');
                    }} 
                  />
                )}
                {activeTab === 'store' && (
                  <>
                    {/* Store Sub-Navigation */}
                    <div className="mb-6 flex gap-4 border-b border-slate-700 pb-2">
                      <button
                        onClick={() => setStoreView('catalog')}
                        className={`px-4 py-2 font-medium text-sm transition-colors ${
                          storeView === 'catalog' || storeView === 'detail'
                            ? 'text-blue-400 border-b-2 border-blue-500'
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        Browse Items
                      </button>
                      <button
                        onClick={() => setStoreView('orders')}
                        className={`px-4 py-2 font-medium text-sm transition-colors ${
                          storeView === 'orders'
                            ? 'text-blue-400 border-b-2 border-blue-500'
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        My Orders
                      </button>
                    </div>

                    {/* Store Views */}
                    {storeView === 'catalog' && <StoreCatalog onItemClick={handleItemClick} />}
                    {storeView === 'detail' && selectedItemId && (
                      <StoreItemDetail
                        itemId={selectedItemId}
                        onBack={handleBackToCatalog}
                        onRedemptionSuccess={handleRedemptionSuccess}
                      />
                    )}
                    {storeView === 'orders' && <OrderHistory onBrowseStore={handleBrowseStore} />}

                    {/* Redemption Confirmation Modal */}
                    {redemption && (
                      <RedeemConfirmationModal
                        redemption={redemption}
                        onClose={handleCloseRedemption}
                      />
                    )}
                  </>
                )}
                {activeTab === 'profile' && <UserProfile />}
                {activeTab === 'admin' && user?.role === 'Admin' && <AdminStoreManagement />}
              </div>
            </Card>
          </UserSyncGuard>
        )}

        {/* Unauthenticated Content */}
        {!isAuthenticated && (
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-slate-100">Welcome</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-300 mb-4">
                Cheersly is a workplace recognition app where employees give compliments and
                recognition to coworkers.
              </p>
              <p className="text-slate-300 mt-4">
                Sign in with your Microsoft account to get started!
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </AuthProvider>
  );
}
