import { useState, useMemo, useCallback } from 'react';
import { calculateChecksum, verifyChecksum } from '../../lib/errorControl';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './ErrorDetection.module.css';

export function ChecksumSim() {
  const [wordsInput, setWordsInput] = useState('1010 0011 1100 0001');
  const [width, setWidth] = useState<8 | 16>(8);
  const [showSteps, setShowSteps] = useState(false);

  const handleReset = useCallback(() => {
    setWordsInput('1010 0011 1100 0001');
    setWidth(8);
  }, []);

  const words = useMemo(() => {
    return wordsInput.trim().split(/[\s,]+/).filter((w) => w.length > 0);
  }, [wordsInput]);

  const result = useMemo(() => calculateChecksum(words, width), [words, width]);

  const verifyWords = useMemo(() => [...result.words, result.checksum], [result]);
  const verification = useMemo(() => verifyChecksum(verifyWords, width), [verifyWords, width]);

  const explanation = (
    <div>
      <p style={{ margin: 0 }}>
        <strong>Internet Checksum ({width}-bit):</strong> Sum all {words.length} words
        using one's complement arithmetic with wraparound carry.
        Final sum = 0x{result.sum.toString(16).toUpperCase()}.
        Checksum = ~sum = <strong>0x{result.checksumHex}</strong> ({result.checksumBin}).
      </p>
      <p style={{ margin: '4px 0 0' }}>
        Verification (including checksum): {verification.isValid ? '✅ Valid — complement is 0' : '❌ Error detected'}.
      </p>
    </div>
  );

  const steps = (
    <div style={{ fontSize: 'var(--fs-xs)' }}>
      <div><strong>Step-by-Step One's Complement Sum:</strong></div>
      {result.steps.map((step) => (
        <div key={step.wordIndex} style={{ marginTop: 4 }}>
          Word {step.wordIndex + 1}: 0x{step.wordHex} ({step.wordBin})
          {step.wordIndex > 0 && (
            <span> | Raw sum = {step.runningSum.toString(2)}
            {step.carryOut > 0 && ` → carry ${step.carryOut} → wrapped = ${step.wrappedSum.toString(2)}`}
            </span>
          )}
        </div>
      ))}
      <div style={{ marginTop: 8 }}>
        <strong>Final Sum:</strong> {result.sum.toString(2).padStart(width, '0')} (0x{result.sum.toString(16).toUpperCase()})
      </div>
      <div>
        <strong>Checksum (NOT):</strong> {result.checksumBin} (0x{result.checksumHex})
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <SimControls
        title="Internet Checksum Simulator"
        explanation={explanation}
        steps={steps}
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((s) => !s)}
        onReset={handleReset}
      />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Input Words</span>
          <select
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value, 10) as 8 | 16)}
            className={styles.selectInput}
          >
            <option value="8">8-bit</option>
            <option value="16">16-bit</option>
          </select>
        </div>

        <div className={styles.inputRow}>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-tertiary)', minWidth: 80 }}>
            Words (binary or hex):
          </span>
          <input
            type="text"
            value={wordsInput}
            onChange={(e) => setWordsInput(e.target.value)}
            className={styles.textInput}
            placeholder="e.g. 1010 0011 1100 or 0xFF 0xAA"
            aria-label="Checksum input words"
          />
        </div>
      </div>

      {/* Results */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Computation</span>
        </div>

        {result.steps.map((step) => (
          <div key={step.wordIndex} className={styles.wordRow}>
            <span className={styles.wordLabel}>W{step.wordIndex + 1}</span>
            <span style={{ flex: 1 }}>{step.wordBin}</span>
            <span style={{ color: 'var(--color-text-tertiary)' }}>0x{step.wordHex}</span>
            {step.carryOut > 0 && (
              <span style={{ color: 'var(--color-unit-3)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-xs)' }}>
                carry↩
              </span>
            )}
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)', marginTop: 'var(--sp-2)' }}>
          <div className={styles.resultBox} style={{ textAlign: 'center' }}>
            <div className={styles.resultLabel}>Sum</div>
            <div className={styles.resultVal} style={{ fontSize: 'var(--fs-md)' }}>
              0x{result.sum.toString(16).toUpperCase().padStart(width / 4, '0')}
            </div>
          </div>
          <div className={styles.resultBox} style={{ textAlign: 'center' }}>
            <div className={styles.resultLabel}>Checksum (~Sum)</div>
            <div className={styles.resultVal} style={{ fontSize: 'var(--fs-md)', color: 'var(--color-unit-3)' }}>
              0x{result.checksumHex}
            </div>
          </div>
        </div>

        <div className={styles.resultBox} style={{ textAlign: 'center' }}>
          <div className={styles.resultLabel}>Verification (add all + checksum)</div>
          <div style={{
            color: verification.isValid ? 'var(--color-success)' : 'var(--color-error)',
            fontWeight: 'var(--fw-bold)',
          }}>
            {verification.isValid ? '✅ Valid — result = all 1s, complement = 0' : '❌ Error detected'}
          </div>
        </div>
      </div>
    </div>
  );
}
