import React from 'react';
import styles from './SvgCanvas.module.css';

interface SvgCanvasProps {
  width?: number;
  height?: number;
  ariaLabel: string;
  showGrid?: boolean;
  children: React.ReactNode;
}

export function SvgCanvas({
  width = 700,
  height = 400,
  ariaLabel,
  showGrid = false,
  children,
}: SvgCanvasProps) {
  return (
    <div className={styles.canvasContainer}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
      >
        {showGrid && (
          <g className="grid-layer">
            {/* Horizontal grid lines */}
            {Array.from({ length: 9 }).map((_, i) => {
              const y = (height / 8) * i;
              return (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={y}
                  x2={width}
                  y2={y}
                  className={styles.gridLine}
                />
              );
            })}
            {/* Vertical grid lines */}
            {Array.from({ length: 15 }).map((_, i) => {
              const x = (width / 14) * i;
              return (
                <line
                  key={`v-${i}`}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2={height}
                  className={styles.gridLine}
                />
              );
            })}
          </g>
        )}
        {children}
      </svg>
    </div>
  );
}
