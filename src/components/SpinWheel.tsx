'use client';

import { useCallback, useEffect, useRef } from 'react';
import { WHEEL_COLORS } from '@/lib/constants';

export interface Group {
  name: string;
  assigned: number;
}

interface SpinWheelProps {
  groups: Group[];
  spinTrigger: number;
  onSpinComplete: (winnerIndex: number) => void;
}

export default function SpinWheel({ groups, spinTrigger, onSpinComplete }: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const rafRef = useRef<number>(0);
  const isSpinningRef = useRef(false);
  const onSpinCompleteRef = useRef(onSpinComplete);

  // Keep callback ref current without re-triggering spin effect
  useEffect(() => {
    onSpinCompleteRef.current = onSpinComplete;
  }, [onSpinComplete]);

  const draw = useCallback((angle: number, currentGroups: Group[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    // Reserve space at top for the arrow indicator
    const r = Math.min(cx, cy) - 50;
    const n = currentGroups.length;
    if (n === 0) return;

    const arc = (2 * Math.PI) / n;
    ctx.clearRect(0, 0, W, H);

    // Outer glow ring behind the wheel
    ctx.save();
    ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.restore();

    // Draw each segment
    for (let i = 0; i < n; i++) {
      const startAngle = angle - Math.PI / 2 + i * arc;
      const endAngle = startAngle + arc;
      const midAngle = startAngle + arc / 2;
      const baseColor = WHEEL_COLORS[i % WHEEL_COLORS.length];

      // Segment fill
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();

      // Radial gradient per slice for depth
      const gx = cx + r * 0.45 * Math.cos(midAngle);
      const gy = cy + r * 0.45 * Math.sin(midAngle);
      const grad = ctx.createRadialGradient(gx, gy, 0, cx, cy, r);
      grad.addColorStop(0, baseColor + 'FF');
      grad.addColorStop(1, baseColor + 'BB');
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Text label inside segment
      ctx.save();
      const textRadius = r * (n <= 6 ? 0.6 : 0.65);
      const tx = cx + textRadius * Math.cos(midAngle);
      const ty = cy + textRadius * Math.sin(midAngle);
      ctx.translate(tx, ty);
      // Rotate text to be readable from the outside edge
      ctx.rotate(midAngle + Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 6;

      const nameFontSize = Math.max(10, Math.min(20, Math.floor(160 / n)));
      ctx.font = `bold ${nameFontSize}px -apple-system, Arial, sans-serif`;
      ctx.fillStyle = '#ffffff';

      if (arc > 0.35) {
        // Enough space: show name + assigned count on two lines
        ctx.fillText(currentGroups[i].name, 0, -nameFontSize * 0.55);
        const countFontSize = Math.max(9, Math.min(14, Math.floor(120 / n)));
        ctx.font = `${countFontSize}px -apple-system, Arial, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillText(`${currentGroups[i].assigned}`, 0, nameFontSize * 0.7);
      } else {
        // Tight space: name only
        ctx.fillText(currentGroups[i].name, 0, 0);
      }
      ctx.restore();
    }

    // Outer border ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center hub
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, 2 * Math.PI);
    const hubGrad = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, 26);
    hubGrad.addColorStop(0, '#9CA3AF');
    hubGrad.addColorStop(1, '#111827');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Arrow pointer at top (fixed, doesn't rotate)
    const arrowTipY = cy - r - 4;
    const arrowHeight = 38;
    const arrowHalfBase = 16;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(cx, arrowTipY);
    ctx.lineTo(cx - arrowHalfBase, arrowTipY - arrowHeight);
    ctx.lineTo(cx + arrowHalfBase, arrowTipY - arrowHeight);
    ctx.closePath();

    // Red gradient arrow
    const arrowGrad = ctx.createLinearGradient(cx, arrowTipY - arrowHeight, cx, arrowTipY);
    arrowGrad.addColorStop(0, '#FC5C65');
    arrowGrad.addColorStop(1, '#D63031');
    ctx.fillStyle = arrowGrad;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }, []);

  // Redraw whenever groups or draw function changes (e.g., after a spin result)
  useEffect(() => {
    draw(rotationRef.current, groups);
  }, [draw, groups]);

  // Spin animation triggered by spinTrigger incrementing
  useEffect(() => {
    if (spinTrigger === 0) return;
    if (isSpinningRef.current) return;

    isSpinningRef.current = true;

    // Capture groups at spin-start time (they won't change mid-spin)
    const capturedGroups = [...groups];
    const startAngle = rotationRef.current;
    const extraSpins = (5 + Math.floor(Math.random() * 6)) * 2 * Math.PI;
    const randomOffset = Math.random() * 2 * Math.PI;
    const targetAngle = startAngle + extraSpins + randomOffset;
    const duration = 3500 + Math.random() * 1500; // 3.5–5s
    const startTime = performance.now();

    const animate = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      // Ease-out quart: starts fast, decelerates smoothly
      const eased = 1 - Math.pow(1 - t, 4);
      const angle = startAngle + (targetAngle - startAngle) * eased;
      rotationRef.current = angle;
      draw(angle, capturedGroups);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rotationRef.current = targetAngle;
        isSpinningRef.current = false;

        // Determine which segment the arrow (top = -π/2) points at
        const n = capturedGroups.length;
        const arc = (2 * Math.PI) / n;
        const normalized =
          ((-targetAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const winner = Math.floor(normalized / arc) % n;
        onSpinCompleteRef.current(winner);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinTrigger]);

  return (
    <canvas
      ref={canvasRef}
      width={520}
      height={520}
      className="block w-full"
      style={{ maxWidth: '520px' }}
    />
  );
}
