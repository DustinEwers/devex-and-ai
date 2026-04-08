import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { getAllUsers } from '../../services/userService';
import { User } from '../../types/user';

export default function UserList() {
  const { instance } = useMsal();
  const [users, setUsers] = useState<User[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const u = await getAllUsers(instance);
        if (mounted) setUsers(u);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [instance]);

  if (isLoading) return <p>Loading users...</p>;
  if (!users || users.length === 0) return <p>No users found.</p>;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">All Users</h3>
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="p-3 border rounded bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{u.firstName} {u.lastName}</div>
                <div className="text-sm text-slate-600">{u.email}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-700">To Give: <strong>{u.pointsToGive}</strong></div>
                <div className="text-sm text-slate-700">Received: <strong>{u.pointsReceived}</strong></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
