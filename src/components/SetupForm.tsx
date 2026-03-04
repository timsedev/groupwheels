'use client';

import { useState, KeyboardEvent } from 'react';
import { WHEEL_COLORS } from '@/lib/constants';

interface Props {
  onComplete: (groups: string[], totalPeople: number) => void;
}

export default function SetupForm({ onComplete }: Props) {
  const [groups, setGroups] = useState<string[]>(['Group A', 'Group B', 'Group C']);
  const [newGroup, setNewGroup] = useState('');
  const [totalPeople, setTotalPeople] = useState('30');
  const [error, setError] = useState('');

  const addGroup = () => {
    const trimmed = newGroup.trim();
    if (!trimmed) return;
    if (groups.includes(trimmed)) {
      setError('Group name already exists');
      return;
    }
    setGroups([...groups, trimmed]);
    setNewGroup('');
    setError('');
  };

  const removeGroup = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addGroup();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseInt(totalPeople, 10);
    if (groups.length < 2) {
      setError('Please add at least 2 groups');
      return;
    }
    if (isNaN(total) || total < 1) {
      setError('Please enter a valid number of people');
      return;
    }
    onComplete(groups, total);
  };

  const total = parseInt(totalPeople, 10) || 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎡</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Group Spinner
          </h1>
          <p className="text-gray-400 mt-2">Randomly assign people to groups</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 rounded-2xl p-6 shadow-2xl space-y-6 border border-gray-700"
        >
          {/* Groups section */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              Groups &mdash; {groups.length} total
            </label>

            <div className="space-y-2 mb-3 max-h-56 overflow-y-auto pr-1">
              {groups.map((group, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-gray-700 rounded-xl px-4 py-2.5"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: WHEEL_COLORS[i % WHEEL_COLORS.length] }}
                  />
                  <span className="flex-1 font-medium text-white">{group}</span>
                  <button
                    type="button"
                    onClick={() => removeGroup(i)}
                    className="text-gray-500 hover:text-red-400 transition-colors text-lg leading-none"
                    aria-label={`Remove ${group}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newGroup}
                onChange={(e) => {
                  setNewGroup(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="New group name..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
              />
              <button
                type="button"
                onClick={addGroup}
                disabled={!newGroup.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Total people section */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Total Number of People
            </label>
            <input
              type="number"
              value={totalPeople}
              onChange={(e) => {
                setTotalPeople(e.target.value);
                setError('');
              }}
              min="1"
              max="9999"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {total > 0 && groups.length >= 2 && (
              <p className="text-sm text-gray-400 mt-2">
                ~{Math.round(total / groups.length)} people per group (avg)
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={groups.length < 2 || !totalPeople || parseInt(totalPeople) < 1}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-lg font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Start Spinning!
          </button>
        </form>
      </div>
    </div>
  );
}
