import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { formatFullDuration } from '../lib/utils';

interface TimerProps {
  onStop: (seconds: number) => void;
  color: string;
}

export function Timer({ onStop, color }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleStop = () => {
    setIsActive(false);
    onStop(seconds);
    setSeconds(0);
  };
  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <div className="relative">
        <svg className="w-64 h-64 transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-100"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray="753.98"
            strokeDashoffset={753.98 * (1 - (seconds % 3600) / 3600)}
            strokeLinecap="round"
            className="transition-all duration-1000"
            style={{ color }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-mono font-bold text-gray-900">
            {formatFullDuration(seconds)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={handleReset}
          className="p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <RotateCcw size={24} />
        </button>

        {!isActive ? (
          <button
            onClick={handleStart}
            className="p-6 rounded-full text-white shadow-lg hover:opacity-90 transition-all transform active:scale-95"
            style={{ backgroundColor: color }}
          >
            <Play size={32} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="p-6 rounded-full text-white shadow-lg hover:opacity-90 transition-all transform active:scale-95"
            style={{ backgroundColor: color }}
          >
            <Pause size={32} fill="currentColor" />
          </button>
        )}

        <button
          onClick={handleStop}
          className="p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          disabled={seconds === 0}
        >
          <Square size={24} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
