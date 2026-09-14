import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 180,
  strokeWidth = 14,
  label = 'ATTENDANCE',
  sublabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  // Determine color theme based on percentage threshold
  const isHealthy = clampedPercentage >= 85;
  const isWarning = clampedPercentage >= 75 && clampedPercentage < 85;

  const strokeColor = isHealthy
    ? '#10b981' // emerald-500
    : isWarning
    ? '#f59e0b' // amber-500
    : '#f43f5e'; // rose-500

  return (
    <div className="relative inline-flex flex-col items-center justify-center" id="circular-attendance-progress">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor={strokeColor} />
          </linearGradient>
        </defs>
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(51, 65, 85, 0.4)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Value */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#circleGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
          {label}
        </span>
        <span className="text-4xl font-extrabold tracking-tight text-white mt-0.5">
          {percentage.toFixed(0)}%
        </span>
        {sublabel && (
          <span className="text-xs text-emerald-400 font-medium mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
