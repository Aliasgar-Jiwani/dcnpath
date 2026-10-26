import { useState, useMemo, useCallback } from 'react';
import { computeVrc, computeLrc, type ParityMode } from '../../lib/errorControl';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './ErrorDetection.module.css';

export function ParityLrcSim() {
  const [dataRows, setDataRows] = useState<string[]>(['1100001', '1100010', '1100011']);
  const [parityMode, setParityMode] = useState<ParityMode>('even');
  const [showSteps, setShowSteps] = useState(false);

  const handleReset = useCallback(() => {
    setDataRows(['1100001', '1100010', '1100011']);
    setParityMode('even');
  }, []);

  const lrcResult = useMemo(() => computeLrc(dataRows, parityMode), [dataRows, parityMode]);

  const singleVrc = useMemo(() => {
    if (dataRows.length > 0 && dataRows[0]) {
      return computeVrc(dataRows[0], parityMode);
    }
    return 0;
  }, [dataRows, parityMode]);

  const handleRowChange = (idx: number, val: string) => {
    const cleaned = val.replace(/[^01]/g, '');
    setDataRows((prev) => {
      const next = [...prev];
      next[idx] = cleaned;
      return next;
    });
  };

  const addRow = () => {
    setDataRows((prev) => [...prev, '1100000']);
  };

  const removeRow = (idx: number) => {
    if (dataRows.length > 1) {
      setDataRows((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const explanation = (
    <div>
      <p style={{ margin: 0 }}>
        <strong>VRC (Vertical Redundancy Check):</strong> Appends one {parityMode} parity bit per row.
        For the first row "{dataRows[0]}", VRC parity bit = <strong>{singleVrc}</strong>.
      </p>
      <p style={{ margin: '4px 0 0' }}>
        <strong>LRC (Longitudinal Redundancy Check):</strong> Computes column parity across all rows,
        forming a 2D parity matrix that can detect and correct single-bit errors.
      </p>
    </div>
  );

  const steps = (
    <div>
      <div><strong>VRC for each row ({parityMode} parity):</strong></div>
      {dataRows.map((row, i) => {
        const ones = (row.match(/1/g) || []).length;
        const p = lrcResult.rowParities[i];
        return (
          <div key={i}>Row {i + 1}: "{row}" → {ones} ones → parity = <strong>{p}</strong></div>
        );
      })}
      <div style={{ marginTop: 8 }}><strong>LRC (column parity):</strong></div>
      <div>Column parities: [{lrcResult.colParities.join(', ')}]</div>
      <div>Overall parity: <strong>{lrcResult.overallParity}</strong></div>
    </div>
  );

  return (
    <div className={styles.container}>
      <SimControls
        title="VRC &amp; LRC (Parity Check)"
        explanation={explanation}
        steps={steps}
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((s) => !s)}
        onReset={handleReset}
      />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>2D Parity Matrix</span>
          <select
            value={parityMode}
            onChange={(e) => setParityMode(e.target.value as ParityMode)}
            className={styles.selectInput}
          >
            <option value="even">Even Parity</option>
            <option value="odd">Odd Parity</option>
          </select>
        </div>

        {/* Data input rows */}
        {dataRows.map((row, i) => (
          <div key={i} className={styles.inputRow}>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-tertiary)', minWidth: 50 }}>
              Row {i + 1}:
            </span>
            <input
              type="text"
              value={row}
              onChange={(e) => handleRowChange(i, e.target.value)}
              className={styles.textInput}
              maxLength={12}
              aria-label={`Data row ${i + 1}`}
            />
            {dataRows.length > 1 && (
              <button
                onClick={() => removeRow(i)}
                style={{
                  background: 'none', border: 'none', color: 'var(--color-text-tertiary)',
                  cursor: 'pointer', fontSize: 16, padding: '2px 6px',
                }}
                aria-label={`Remove row ${i + 1}`}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addRow}
          style={{
            padding: '4px 12px', borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--color-border)', background: 'transparent',
            color: 'var(--color-text-secondary)', fontSize: 'var(--fs-xs)',
            cursor: 'pointer', alignSelf: 'flex-start',
          }}
        >
          + Add Row
        </button>

        {/* Matrix visualization */}
        {lrcResult.matrix.length > 0 && (
          <div className={styles.matrix}>
            {/* Header */}
            <div className={styles.matrixRow}>
              <div className={styles.matrixCell} style={{ background: 'transparent', border: 'none' }}></div>
              {lrcResult.matrix[0]?.map((_, ci) => (
                <div key={ci} className={styles.matrixCell} style={{ background: 'transparent', border: 'none', fontSize: 9, color: 'var(--color-text-tertiary)' }}>
                  b{ci + 1}
                </div>
              ))}
              <div className={styles.matrixCell} style={{ background: 'transparent', border: 'none', fontSize: 9, color: 'var(--color-accent-500)' }}>
                VRC
              </div>
            </div>

            {/* Data rows + VRC */}
            {lrcResult.matrix.map((row, ri) => (
              <div key={ri} className={styles.matrixRow}>
                <div className={styles.matrixCell} style={{ background: 'transparent', border: 'none', fontSize: 9, color: 'var(--color-text-tertiary)' }}>
                  R{ri + 1}
                </div>
                {row.map((bit, ci) => (
                  <div key={ci} className={styles.matrixCell}>{bit}</div>
                ))}
                <div className={`${styles.matrixCell} ${styles.parityCell}`}>
                  {lrcResult.rowParities[ri]}
                </div>
              </div>
            ))}

            {/* LRC row */}
            <div className={styles.matrixRow}>
              <div className={styles.matrixCell} style={{ background: 'transparent', border: 'none', fontSize: 9, color: 'var(--color-accent-500)' }}>
                LRC
              </div>
              {lrcResult.colParities.map((p, ci) => (
                <div key={ci} className={`${styles.matrixCell} ${styles.parityCell}`}>{p}</div>
              ))}
              <div className={`${styles.matrixCell} ${styles.parityCell}`} style={{ background: 'var(--color-unit-3)' }}>
                {lrcResult.overallParity}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
