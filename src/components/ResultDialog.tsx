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

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

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
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(13,1,23,0.8)' }}
        onClick={onClose}
      />

      {/* Dialog card */}
      <div
        className="relative rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center animate-scale-in border"
        style={{
          backgroundColor: '#130328',
          borderColor: 'rgba(139,92,246,0.3)',
        }}
      >
        {/* Top accent bar */}
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

        <p className="mb-5" style={{ color: '#c4b5fd' }}>
          <span className="text-white font-semibold">{groupName}</span> now has{' '}
          <span className="text-white font-semibold">{newCount}</span>{' '}
          {newCount === 1 ? 'person' : 'people'}
        </p>

        {/* Stats row */}
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>
              {totalAssigned}
            </div>
            <div style={{ color: 'rgba(196,181,253,0.6)' }}>assigned</div>
          </div>
          <div className="w-px" style={{ backgroundColor: 'rgba(139,92,246,0.3)' }} />
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#06b6d4' }}>
              {remaining}
            </div>
            <div style={{ color: 'rgba(196,181,253,0.6)' }}>remaining</div>
          </div>
          <div className="w-px" style={{ backgroundColor: 'rgba(139,92,246,0.3)' }} />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalPeople}</div>
            <div style={{ color: 'rgba(196,181,253,0.6)' }}>total</div>
          </div>
        </div>

        {/* Mini progress bar */}
        <div
          className="w-full h-2 rounded-full mb-6 overflow-hidden"
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

        {allDone && (
          <p className="font-semibold mb-4 text-sm" style={{ color: '#06b6d4' }}>
            🎊 All {totalPeople} people have been assigned!
          </p>
        )}

        <button
          ref={buttonRef}
          onClick={onClose}
          className="w-full py-3 rounded-xl text-base font-bold transition-all hover:scale-105 active:scale-95 text-white"
          style={{ backgroundColor: '#8b5cf6' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7c3aed')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8b5cf6')}
        >
          {allDone ? 'View Results' : 'Spin Again'}
        </button>
      </div>
    </div>
  );
}
