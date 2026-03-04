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
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎡</div>
          <h1
            className="text-4xl font-bold"
            style={{
              background: 'linear-gradient(to right, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Group Spinner
          </h1>
          <p className="mt-2" style={{ color: '#c4b5fd' }}>
            Randomly assign people to groups
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 shadow-2xl space-y-6 border"
          style={{
            backgroundColor: 'rgba(139,92,246,0.08)',
            borderColor: 'rgba(139,92,246,0.25)',
          }}
        >
          {/* Groups section */}
          <div>
            <label
              className="block text-sm font-semibold mb-3 uppercase tracking-wide"
              style={{ color: '#c4b5fd' }}
            >
              Groups &mdash; {groups.length} total
            </label>

            <div className="space-y-2 mb-3 max-h-56 overflow-y-auto pr-1">
              {groups.map((group, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                  style={{ backgroundColor: 'rgba(139,92,246,0.12)' }}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: WHEEL_COLORS[i % WHEEL_COLORS.length] }}
                  />
                  <span className="flex-1 font-medium text-white">{group}</span>
                  <button
                    type="button"
                    onClick={() => removeGroup(i)}
                    className="text-lg leading-none transition-colors"
                    style={{ color: 'rgba(196,181,253,0.5)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(196,181,253,0.5)')}
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
                className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-white placeholder-opacity-50"
                style={{
                  backgroundColor: 'rgba(139,92,246,0.12)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  color: '#ffffff',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#8b5cf6')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)')}
              />
              <button
                type="button"
                onClick={addGroup}
                disabled={!newGroup.trim()}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#8b5cf6', color: '#ffffff' }}
                onMouseEnter={(e) => {
                  if (newGroup.trim()) e.currentTarget.style.backgroundColor = '#7c3aed';
                }}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8b5cf6')}
              >
                Add
              </button>
            </div>
          </div>

          {/* Total people section */}
          <div>
            <label
              className="block text-sm font-semibold mb-2 uppercase tracking-wide"
              style={{ color: '#c4b5fd' }}
            >
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
              className="w-full rounded-xl px-4 py-3 text-xl font-bold focus:outline-none text-white"
              style={{
                backgroundColor: 'rgba(139,92,246,0.12)',
                border: '1px solid rgba(139,92,246,0.3)',
                color: '#ffffff',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#8b5cf6')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)')}
            />
            {total > 0 && groups.length >= 2 && (
              <p className="text-sm mt-2" style={{ color: '#c4b5fd' }}>
                ~{Math.round(total / groups.length)} people per group (avg)
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-sm rounded-lg px-3 py-2"
              style={{
                color: '#fca5a5',
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={groups.length < 2 || !totalPeople || parseInt(totalPeople) < 1}
            className="w-full py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            style={{
              background: 'linear-gradient(to right, #8b5cf6, #7c3aed)',
              color: '#ffffff',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #a78bfa, #8b5cf6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #8b5cf6, #7c3aed)';
            }}
          >
            Start Spinning!
          </button>
        </form>
      </div>
    </div>
  );
}
