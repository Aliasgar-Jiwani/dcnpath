import { useState, useMemo, useCallback } from 'react';
import { crcDivide, polynomialToBinary, crcVerify } from '../../lib/errorControl';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './ErrorDetection.module.css';

export function CrcSim() {
  const [data, setData] = useState('1001');
  const [generator, setGenerator] = useState('1011');
  const [showSteps, setShowSteps] = useState(false);

  const handleReset = useCallback(() => {
    setData('1001');
    setGenerator('1011');
  }, []);

  const genBinary = useMemo(() => polynomialToBinary(generator), [generator]);
  const crcResult = useMemo(() => crcDivide(data.replace(/[^01]/g, '') || '1001', genBinary), [data, genBinary]);
  const verifyResult = useMemo(() => crcVerify(crcResult.codeword, genBinary), [crcResult.codeword, genBinary]);

  const explanation = (
    <div>
      <p style={{ margin: 0 }}>
        <strong>CRC (Cyclic Redundancy Check):</strong> Data "{crcResult.data}" is augmented
        with {genBinary.length - 1} zeros → "{crcResult.augmentedData}". Dividing by generator
        "{genBinary}" using modulo-2 (XOR) division yields remainder = <strong>{crcResult.remainder}</strong>.
      </p>
      <p style={{ margin: '4px 0 0' }}>
        Transmitted codeword: <strong>{crcResult.codeword}</strong>.
        Receiver verification: remainder = {verifyResult.remainder} → {verifyResult.isValid ? '✅ No error' : '❌ Error detected'}.
      </p>
    </div>
  );

  const steps = (
    <div style={{ fontSize: 'var(--fs-xs)' }}>
      <div><strong>Step-by-Step Modulo-2 Division:</strong></div>
      <div>Augmented data: {crcResult.augmentedData} (data + {genBinary.length - 1} zeros)</div>
      <div>Generator: {genBinary} (degree {genBinary.length - 1})</div>
      <div style={{ marginTop: 4 }}>
        {crcResult.steps.map((step, i) => (
          <div key={i} style={{ marginTop: 4, padding: '2px 0', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-tertiary)' }}>Step {i + 1}:</span>{' '}
            Dividend = {step.currentDividend} | {step.appliedXor ? `XOR with ${step.divisor}` : 'MSB=0, XOR with 0s'} |{' '}
            Q-bit = {step.quotientBit} | Remainder so far = {step.intermediateRemainder}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <strong>Final Remainder (CRC): {crcResult.remainder}</strong>
      </div>
      <div>Quotient: {crcResult.quotient}</div>
      <div>Codeword: {crcResult.data} + {crcResult.remainder} = <strong>{crcResult.codeword}</strong></div>
    </div>
  );

  return (
    <div className={styles.container}>
      <SimControls
        title="CRC Division Simulator"
        explanation={explanation}
        steps={steps}
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((s) => !s)}
        onReset={handleReset}
      />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Input</span>
        </div>

        <div className={styles.inputRow}>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-tertiary)', minWidth: 80 }}>Data bits:</span>
          <input
            type="text"
            value={data}
            onChange={(e) => setData(e.target.value.replace(/[^01]/g, ''))}
            className={styles.textInput}
            maxLength={16}
            placeholder="e.g. 1001"
            aria-label="Data bits"
          />
        </div>

        <div className={styles.inputRow}>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-tertiary)', minWidth: 80 }}>Generator:</span>
          <input
            type="text"
            value={generator}
            onChange={(e) => setGenerator(e.target.value)}
            className={styles.textInput}
            maxLength={20}
            placeholder="e.g. 1011 or x^3+x+1"
            aria-label="Generator polynomial"
          />
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-tertiary)' }}>
            Binary: {genBinary}
          </span>
        </div>
      </div>

      {/* Results */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>CRC Result</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
          <div className={styles.resultBox}>
            <div className={styles.resultLabel}>Augmented Data</div>
            <div className={styles.resultVal} style={{ fontSize: 'var(--fs-md)' }}>
              {crcResult.augmentedData}
            </div>
          </div>
          <div className={styles.resultBox}>
            <div className={styles.resultLabel}>CRC Remainder</div>
            <div className={styles.resultVal} style={{ fontSize: 'var(--fs-md)' }}>
              {crcResult.remainder}
            </div>
          </div>
        </div>

        <div className={styles.resultBox} style={{ textAlign: 'center' }}>
          <div className={styles.resultLabel}>Transmitted Codeword</div>
          <div className={styles.resultVal}>
            <span style={{ color: 'var(--color-text-primary)' }}>{crcResult.data}</span>
            <span style={{ color: 'var(--color-unit-3)' }}>{crcResult.remainder}</span>
          </div>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
            Data bits | CRC bits
          </div>
        </div>

        <div className={styles.resultBox}>
          <div className={styles.resultLabel}>Receiver Verification</div>
          <div style={{ color: verifyResult.isValid ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 'var(--fw-bold)' }}>
            {verifyResult.isValid ? '✅ Valid — remainder is all zeros' : `❌ Error detected — syndrome: ${verifyResult.syndrome}`}
          </div>
        </div>
      </div>
    </div>
  );
}
