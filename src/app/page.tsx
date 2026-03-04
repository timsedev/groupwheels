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
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      {/* Header */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Group Spinner</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {groups.length} groups &middot; {totalPeople} people total
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
          >
            ← Reset
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-400">
              {totalAssigned} of {totalPeople} assigned
            </span>
            <span className="text-gray-400">
              {Math.round((totalAssigned / totalPeople) * 100)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(totalAssigned / totalPeople) * 100}%` }}
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
            className="w-full py-4 text-xl font-bold rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
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
          <div className="w-full text-center bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-xl font-bold text-green-400 mb-1">All done!</p>
            <p className="text-gray-400 text-sm mb-4">
              All {totalPeople} people have been assigned
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-colors"
            >
              Start Over
            </button>
          </div>
        )}
      </div>

      {/* Group summary chips */}
      <div className="mt-6 w-full max-w-2xl">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Assignment Summary</p>
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
                <span
                  className="text-sm font-bold flex-shrink-0"
                  style={{ color }}
                >
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
