import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useUser } from '../../contexts/UserContext';
import { CreateCheerRequest } from '../../types/cheer';
import { User } from '../../types/user';
import * as cheerService from '../../services/cheerService';
import * as userService from '../../services/userService';
import { Card, Button, Textarea, Input, Alert, Spinner } from '../ui';

interface CreateCheerFormProps {
  onSuccess?: () => void;
}

export const CreateCheerForm: React.FC<CreateCheerFormProps> = ({ onSuccess }) => {
  const { instance } = useMsal();
  const { user: currentUser, syncUser } = useUser();

  const [message, setMessage] = useState('');
  const [pointsPerRecipient, setPointsPerRecipient] = useState(1);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser?.id]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      console.log('Loading users, current user ID:', currentUser?.id);
      const users = await userService.getAllUsers(instance);
      console.log('Loaded users:', users);
      // Filter out the current user
      const otherUsers = users.filter(u => u.id !== currentUser?.id);
      console.log('Filtered users (excluding current user):', otherUsers);
      setAllUsers(otherUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(`Failed to load users: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoadingUsers(false);
    }
  };

  const totalPoints = pointsPerRecipient * selectedRecipients.length;
  const canAfford = currentUser ? currentUser.pointsToGive >= totalPoints : false;

  const handleRecipientToggle = (userId: string) => {
    setSelectedRecipients(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        if (prev.length >= 100) {
          setError('Cannot select more than 100 recipients');
          return prev;
        }
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    if (message.length > 2000) {
      setError('Message cannot exceed 2000 characters');
      return;
    }

    if (selectedRecipients.length === 0) {
      setError('Please select at least one recipient');
      return;
    }

    if (pointsPerRecipient < 1) {
      setError('Points per recipient must be at least 1');
      return;
    }

    if (!canAfford) {
      setError(`Insufficient points. You have ${currentUser?.pointsToGive} but need ${totalPoints}`);
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setShowConfirmation(false);

      const request: CreateCheerRequest = {
        message,
        pointsPerRecipient,
        recipientIds: selectedRecipients
      };

      await cheerService.createCheer(instance, request);
      
      // Sync user to update points
      await syncUser();

      // Reset form
      setMessage('');
      setPointsPerRecipient(1);
      setSelectedRecipients([]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error creating cheer:', err);
      setError(err.message || 'Failed to create cheer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  if (loadingUsers) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="md" color="blue" />
        <span className="ml-3 text-slate-300">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-100 mb-6">Send a Cheer</h1>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          {/* Points Available */}
          <div className="mb-6 p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">Available Points</p>
            <p className="text-3xl font-bold text-blue-400">{currentUser?.pointsToGive || 0}</p>
          </div>

          {/* Message */}
          <Textarea
            label="Message (Markdown supported)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="Write your message here... You can use **bold**, *italic*, and other Markdown formatting."
            className="mb-6"
          />
          <p className="text-sm text-slate-400 -mt-4 mb-6">
            {message.length} / 2000 characters
          </p>

          {/* Points Per Recipient */}
          <Input
            type="number"
            label="Points Per Recipient"
            value={pointsPerRecipient.toString()}
            onChange={(e) => setPointsPerRecipient(Math.max(1, parseInt(e.target.value) || 1))}
            className="mb-6"
          />

          {/* Recipients */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Recipients ({selectedRecipients.length} selected)
            </label>
            <div className="border border-slate-600 bg-slate-700/50 rounded-lg p-4 max-h-64 overflow-y-auto">
              {allUsers.length === 0 ? (
                <p className="text-slate-400 text-sm">No users available to select. Make sure other users have signed in at least once.</p>
              ) : (
                allUsers.map(user => (
                  <label
                    key={user.id}
                    className="flex items-center p-2 hover:bg-slate-600/50 rounded cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(user.id)}
                      onChange={() => handleRecipientToggle(user.id)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-500 rounded bg-slate-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-100">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Total Calculation */}
          <div className="mb-6 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Total Points Required:</span>
              <span className={`text-2xl font-bold ${canAfford ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalPoints}
              </span>
            </div>
            {!canAfford && totalPoints > 0 && (
              <p className="text-sm text-rose-400 mt-2">
                Insufficient points! You need {totalPoints - (currentUser?.pointsToGive || 0)} more points.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !canAfford || selectedRecipients.length === 0 || !message.trim()}
            variant="primary"
            className="w-full"
          >
            {loading ? 'Sending...' : 'Send Cheer'}
          </Button>
        </form>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Confirm Cheer</h2>
            <p className="text-slate-300 mb-2">
              You are about to send a cheer to <strong className="text-slate-100">{selectedRecipients.length}</strong> recipient(s).
            </p>
            <p className="text-slate-300 mb-4">
              This will cost <strong className="text-amber-400">{totalPoints}</strong> points.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleCancel}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={loading}
                variant="primary"
                className="flex-1"
              >
                {loading ? 'Sending...' : 'Confirm'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
