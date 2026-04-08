import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { resetMonthlyPoints } from '../../services/userService';
import { useUser } from '../../contexts/UserContext';

export default function AdminResetPanel() {
  const { instance } = useMsal();
  const { syncUser } = useUser();
  const [isRunning, setIsRunning] = useState(false);

  async function runReset() {
    if (!confirm('Are you sure you want to reset monthly points for all users?')) return;
    setIsRunning(true);
    const ok = await resetMonthlyPoints(instance);
    setIsRunning(false);
    if (ok) {
      // Refresh current user's values
      await syncUser();
      alert('Monthly points reset completed');
    } else {
      alert('Failed to reset monthly points');
    }
  }

  return (
    <div className="mt-6 bg-white p-4 border rounded">
      <h3 className="text-lg font-semibold mb-2">Admin: Monthly Reset</h3>
      <p className="text-sm text-slate-600 mb-3">This action sets all users' PointsToGive to the monthly default.</p>
      <button
        className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
        onClick={runReset}
        disabled={isRunning}
      >
        {isRunning ? 'Running...' : 'Reset Monthly Points'}
      </button>
    </div>
  );
}
