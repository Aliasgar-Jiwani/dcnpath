import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
}

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 5,
  color = 'var(--color-accent-500)',
  showLabel = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <div className={styles.ringContainer} style={{ width: size, height: size }}>
      <svg className={styles.ring} width={size} height={size} aria-label={`${Math.round(progress * 100)}% complete`}>
        <circle
          className={styles.ringBg}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className={styles.ringProgress}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {showLabel && (
        <span className={styles.ringLabel}>
          {Math.round(progress * 100)}%
        </span>
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  color = 'var(--color-accent-500)',
  height = 6,
}: ProgressBarProps) {
  return (
    <div
      className={styles.barContainer}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={styles.bar}
        style={{
          width: `${progress * 100}%`,
          background: color,
        }}
      />
    </div>
  );
}
