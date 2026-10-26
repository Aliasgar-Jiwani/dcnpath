import React from 'react';
import styles from './SimControls.module.css';

interface SimControlsProps {
  title: string;
  explanation: React.ReactNode;
  steps?: React.ReactNode;
  showSteps?: boolean;
  onToggleSteps?: () => void;
  onReset: () => void;
  children?: React.ReactNode;
}

export function SimControls({
  title,
  explanation,
  steps,
  showSteps = false,
  onToggleSteps,
  onReset,
  children,
}: SimControlsProps) {
  return (
    <div className={styles.controlsContainer}>
      <div className={styles.controlsHeader}>
        <div className={styles.titleArea}>
          <span className={styles.titleIcon} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </span>
          <h3 className={styles.title}>{title}</h3>
        </div>

        <div className={styles.headerActions}>
          {steps && onToggleSteps && (
            <button
              className={`${styles.actionBtn} ${showSteps ? styles.activeActionBtn : ''}`}
              onClick={onToggleSteps}
              aria-expanded={showSteps}
              aria-label="Toggle step-by-step breakdown"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>{showSteps ? 'Hide Steps' : 'Step-by-Step'}</span>
            </button>
          )}

          <button
            className={styles.actionBtn}
            onClick={onReset}
            aria-label="Reset simulation to default state"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Custom simulator sliders/buttons */}
      {children && <div className={styles.controlsBody}>{children}</div>}

      {/* Educational live explanation */}
      <div className={styles.explanationPanel} role="status" aria-live="polite">
        <div className={styles.explanationHeader}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>What is happening?</span>
        </div>
        <div className={styles.explanationContent}>{explanation}</div>
      </div>

      {/* Step by step panel if toggled */}
      {showSteps && steps && (
        <div className={styles.stepsPanel} aria-label="Step by step derivation">
          {steps}
        </div>
      )}
    </div>
  );
}
