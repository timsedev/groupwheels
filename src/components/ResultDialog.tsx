'use client';

import { useEffect, useRef } from 'react';
import { WHEEL_COLORS } from '@/lib/constants';

interface Props {
  groupName: string;
  groupIndex: number;
  newCount: number;
  totalAssigned: number;
  totalPeople: number;
  onClose: () => void;
}

export default function ResultDialog({
  groupName,
  groupIndex,
  newCount,
  totalAssigned,
  totalPeople,
  onClose,
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const allDone = totalAssigned >= totalPeople;
  const remaining = totalPeople - totalAssigned;
  const color = WHEEL_COLORS[groupIndex % WHEEL_COLORS.length];

  // Focus button on mount for keyboard accessibility
  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Spin result"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog card */}
      <div className="relative bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center animate-scale-in">
        {/* Confetti-like decorative top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
          style={{ backgroundColor: color }}
        />

        <div className="text-5xl mb-4">{allDone ? '🏆' : '🎉'}</div>

        {/* Group name badge */}
        <div
          className="inline-block px-5 py-2 rounded-full text-lg font-bold mb-4 shadow-lg"
          style={{
            backgroundColor: color + '33',
            border: `2px solid ${color}`,
            color: color,
          }}
        >
          {groupName}
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">
          {allDone ? 'All done!' : 'Person assigned!'}
        </h2>

        <p className="text-gray-400 mb-5">
          <span className="text-white font-semibold">{groupName}</span> now has{' '}
          <span className="text-white font-semibold">{newCount}</span>{' '}
          {newCount === 1 ? 'person' : 'people'}
        </p>

        {/* Progress ring / stats row */}
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-400">{totalAssigned}</div>
            <div className="text-gray-500">assigned</div>
          </div>
          <div className="w-px bg-gray-700" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">{remaining}</div>
            <div className="text-gray-500">remaining</div>
          </div>
          <div className="w-px bg-gray-700" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalPeople}</div>
            <div className="text-gray-500">total</div>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="w-full h-2 bg-gray-700 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(totalAssigned / totalPeople) * 100}%`,
              backgroundColor: color,
            }}
          />
        </div>

        {allDone && (
          <p className="text-green-400 font-semibold mb-4 text-sm">
            🎊 All {totalPeople} people have been assigned!
          </p>
        )}

        <button
          ref={buttonRef}
          onClick={onClose}
          className="w-full py-3 rounded-xl text-base font-bold transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: color,
            color: '#fff',
          }}
        >
          {allDone ? 'View Results' : 'Spin Again'}
        </button>
      </div>
    </div>
  );
}
