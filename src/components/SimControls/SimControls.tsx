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
          <span style={{ fontSize: 'var(--fs-lg)' }} aria-hidden="true">
            ⚡
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
              <span>{showSteps ? 'Hide Steps' : 'Show Me the Steps'}</span>
            </button>
          )}

          <button
            className={styles.actionBtn}
            onClick={onReset}
            aria-label="Reset simulation to default state"
          >
            <span>↺ Reset</span>
          </button>
        </div>
      </div>

      {/* Custom simulator sliders/buttons */}
      {children && <div className={styles.controlsBody}>{children}</div>}

      {/* Educational live explanation */}
      <div className={styles.explanationPanel} role="status" aria-live="polite">
        <div className={styles.explanationHeader}>
          <span>💡 What is happening?</span>
        </div>
        <div>{explanation}</div>
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
