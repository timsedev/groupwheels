'use client';

import { useState, useCallback } from 'react';
import SetupForm from '@/components/SetupForm';
import SpinWheel, { Group } from '@/components/SpinWheel';
import ResultDialog from '@/components/ResultDialog';
import { WHEEL_COLORS } from '@/lib/constants';

interface LastResult {
  groupName: string;
  groupIndex: number;
  newCount: number;
  totalAssigned: number;
}

export default function Home() {
  const [view, setView] = useState<'setup' | 'wheel'>('setup');
  const [groups, setGroups] = useState<Group[]>([]);
  const [totalPeople, setTotalPeople] = useState(0);
  const [spinTrigger, setSpinTrigger] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const totalAssigned = groups.reduce((sum, g) => sum + g.assigned, 0);
  const allDone = totalAssigned >= totalPeople && totalPeople > 0;

  const handleSetupComplete = (groupNames: string[], total: number) => {
    setGroups(groupNames.map((name) => ({ name, assigned: 0 })));
    setTotalPeople(total);
    setSpinTrigger(0);
    setIsSpinning(false);
    setLastResult(null);
    setShowDialog(false);
    setView('wheel');
  };

  const handleSpin = () => {
    if (isSpinning || allDone) return;
    setIsSpinning(true);
    setSpinTrigger((prev) => prev + 1);
  };

  const handleSpinComplete = useCallback(
    (winnerIndex: number) => {
      setGroups((prev) => {
        const updated = prev.map((g, i) =>
          i === winnerIndex ? { ...g, assigned: g.assigned + 1 } : g
        );
        const newTotalAssigned = updated.reduce((sum, g) => sum + g.assigned, 0);
        setLastResult({
          groupName: updated[winnerIndex].name,
          groupIndex: winnerIndex,
          newCount: updated[winnerIndex].assigned,
          totalAssigned: newTotalAssigned,
        });
        return updated;
      });
      setIsSpinning(false);
      setShowDialog(true);
    },
    []
  );

  const handleDialogClose = () => {
    setShowDialog(false);
    setLastResult(null);
  };

  const handleReset = () => {
    setView('setup');
    setGroups([]);
    setTotalPeople(0);
    setSpinTrigger(0);
    setIsSpinning(false);
    setLastResult(null);
    setShowDialog(false);
  };

  if (view === 'setup') {
    return <SetupForm onComplete={handleSetupComplete} />;
  }

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4">
      {/* Header */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Group Spinner</h1>
            <p className="text-sm mt-0.5" style={{ color: '#c4b5fd' }}>
              {groups.length} groups &middot; {totalPeople} people total
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-sm px-3 py-1.5 rounded-lg border transition-colors"
            style={{
              color: '#c4b5fd',
              borderColor: 'rgba(139,92,246,0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = '#8b5cf6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#c4b5fd';
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
            }}
          >
            ← Reset
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span style={{ color: '#c4b5fd' }}>
              {totalAssigned} of {totalPeople} assigned
            </span>
            <span style={{ color: '#c4b5fd' }}>
              {Math.round((totalAssigned / totalPeople) * 100)}%
            </span>
          </div>
          <div
            className="w-full h-2.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(139,92,246,0.2)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(totalAssigned / totalPeople) * 100}%`,
                background: 'linear-gradient(to right, #8b5cf6, #06b6d4)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Wheel */}
      <div className="flex justify-center w-full max-w-lg">
        <SpinWheel
          groups={groups}
          spinTrigger={spinTrigger}
          onSpinComplete={handleSpinComplete}
        />
      </div>

      {/* Spin button or completion */}
      <div className="mt-6 w-full max-w-sm flex flex-col items-center gap-4">
        {!allDone ? (
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-4 text-xl font-bold rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            style={{
              background: 'linear-gradient(to right, #8b5cf6, #7c3aed)',
            }}
            onMouseEnter={(e) => {
              if (!isSpinning) {
                e.currentTarget.style.background = 'linear-gradient(to right, #a78bfa, #8b5cf6)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #8b5cf6, #7c3aed)';
            }}
          >
            {isSpinning ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Spinning…
              </span>
            ) : (
              'SPIN!'
            )}
          </button>
        ) : (
          <div
            className="w-full text-center rounded-2xl p-6 border"
            style={{
              backgroundColor: 'rgba(139,92,246,0.1)',
              borderColor: 'rgba(139,92,246,0.3)',
            }}
          >
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-xl font-bold mb-1" style={{ color: '#06b6d4' }}>
              All done!
            </p>
            <p className="text-sm mb-4" style={{ color: '#c4b5fd' }}>
              All {totalPeople} people have been assigned
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl font-semibold transition-colors"
              style={{ backgroundColor: '#8b5cf6' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7c3aed')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8b5cf6')}
            >
              Start Over
            </button>
          </div>
        )}
      </div>

      {/* Group summary chips */}
      <div className="mt-6 w-full max-w-2xl">
        <p
          className="text-xs uppercase tracking-wide mb-3"
          style={{ color: 'rgba(196,181,253,0.6)' }}
        >
          Assignment Summary
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {groups.map((g, i) => {
            const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
            return (
              <div
                key={g.name}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                style={{
                  borderColor: color + '66',
                  backgroundColor: color + '11',
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-white truncate flex-1">
                  {g.name}
                </span>
                <span className="text-sm font-bold flex-shrink-0" style={{ color }}>
                  {g.assigned}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Result Dialog */}
      {showDialog && lastResult && (
        <ResultDialog
          groupName={lastResult.groupName}
          groupIndex={lastResult.groupIndex}
          newCount={lastResult.newCount}
          totalAssigned={lastResult.totalAssigned}
          totalPeople={totalPeople}
          onClose={handleDialogClose}
        />
      )}
    </div>
  );
}
