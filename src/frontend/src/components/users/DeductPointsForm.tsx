import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useUser } from '../../contexts/UserContext';
import { deductPoints } from '../../services/userService';

export default function DeductPointsForm({ userId }: { userId: string }) {
  const { instance } = useMsal();
  const { syncUser, user } = useUser();
  const [amount, setAmount] = useState<number>(5);
  const [isSaving, setIsSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (amount <= 0) {
      alert('Amount must be greater than zero');
      return;
    }
    if (amount > user.pointsToGive) {
      alert('Insufficient points to give');
      return;
    }

    setIsSaving(true);
    const ok = await deductPoints(instance, userId, amount);
    setIsSaving(false);

    if (ok) {
      // Refresh user data
      await syncUser();
      alert(`Successfully deducted ${amount} points`);
    } else {
      alert('Failed to deduct points.');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label className="block text-sm text-slate-600">Give points (demo)</label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="border rounded px-2 py-1 w-28"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
          disabled={isSaving}
        >
          {isSaving ? 'Sending...' : 'Give'}
        </button>
      </div>
    </form>
  );
}
