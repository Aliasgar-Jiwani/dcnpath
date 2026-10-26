import { useState, useMemo, useCallback } from 'react';
import { hammingEncode, hammingDecode } from '../../lib/errorControl';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './ErrorDetection.module.css';

type HamMode = 'encode' | 'decode';

export function HammingSim() {
  const [mode, setMode] = useState<HamMode>('encode');
  const [dataBits, setDataBits] = useState('1011');
  const [receivedBits, setReceivedBits] = useState('');
  const [errorPos, setErrorPos] = useState<number | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const handleReset = useCallback(() => {
    setDataBits('1011');
    setReceivedBits('');
    setErrorPos(null);
    setMode('encode');
  }, []);

  const encodeResult = useMemo(() => hammingEncode(dataBits.replace(/[^01]/g, '') || '1011'), [dataBits]);

  // Simulate error injection
  const codewordWithError = useMemo(() => {
    if (errorPos !== null && errorPos >= 1 && errorPos <= encodeResult.codeword.length) {
      const arr = encodeResult.codeword.split('');
      arr[errorPos - 1] = arr[errorPos - 1] === '1' ? '0' : '1';
      return arr.join('');
    }
    return encodeResult.codeword;
  }, [encodeResult.codeword, errorPos]);

  const decodeInput = mode === 'decode' && receivedBits.replace(/[^01]/g, '').length > 0
    ? receivedBits.replace(/[^01]/g, '')
    : codewordWithError;

  const decodeResult = useMemo(() => hammingDecode(decodeInput), [decodeInput]);

  const explanation = mode === 'encode' ? (
    <div>
      <p style={{ margin: 0 }}>
        <strong>Hamming Encoding:</strong> Data "{encodeResult.dataBits}" ({encodeResult.m} data bits)
        requires <strong>{encodeResult.r}</strong> parity bits (2^{encodeResult.r} ≥ {encodeResult.m} + {encodeResult.r} + 1).
        Total codeword = {encodeResult.totalBits} bits.
      </p>
      <p style={{ margin: '4px 0 0' }}>
        Codeword: <strong>{encodeResult.codeword}</strong>
        {errorPos && ` → Error injected at position ${errorPos}: ${codewordWithError}`}
      </p>
    </div>
  ) : (
    <div>
      <p style={{ margin: 0 }}>
        <strong>Hamming Decoding:</strong> Received "{decodeResult.receivedCodeword}".
        Syndrome = {decodeResult.syndromeBits} (decimal {decodeResult.errorPosition}).
        {decodeResult.hasError
          ? ` Error at position ${decodeResult.errorPosition} → corrected: ${decodeResult.correctedCodeword}`
          : ' No error detected.'
        }
      </p>
      <p style={{ margin: '4px 0 0' }}>
        Extracted data: <strong>{decodeResult.extractedData}</strong>
      </p>
    </div>
  );

  const steps = mode === 'encode' ? (
    <div style={{ fontSize: 'var(--fs-xs)' }}>
      <div><strong>Parity Bit Placement:</strong></div>
      <div>Parity positions (powers of 2): {encodeResult.parityPositions.join(', ')}</div>
      <div>Data positions: {encodeResult.dataPositions.join(', ')}</div>
      <div style={{ marginTop: 8 }}><strong>Parity Bit Calculation (even parity):</strong></div>
      {encodeResult.positionDetails
        .filter((p) => p.isParity)
        .map((p) => (
          <div key={p.position}>
            P{p.position} covers positions [{p.coveredPositions?.join(', ')}] → bit = <strong>{p.bitValue}</strong>
          </div>
        ))}
      <div style={{ marginTop: 8 }}>
        <strong>Final Codeword:</strong>{' '}
        {encodeResult.positionDetails.map((p) => (
          <span key={p.position} style={{ color: p.isParity ? 'var(--color-unit-3)' : 'var(--color-text-primary)' }}>
            {p.bitValue}
          </span>
        ))}
      </div>
    </div>
  ) : (
    <div style={{ fontSize: 'var(--fs-xs)' }}>
      <div><strong>Syndrome Calculation:</strong></div>
      <div>Syndrome bits: {decodeResult.syndromeBits}</div>
      <div>Syndrome decimal value: {decodeResult.errorPosition}</div>
      <div>
        {decodeResult.hasError
          ? `Error detected at position ${decodeResult.errorPosition}. Flipping bit ${decodeResult.errorPosition}.`
          : 'Syndrome = 0 → No error.'}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <SimControls
        title="Hamming Code Simulator"
        explanation={explanation}
        steps={steps}
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((s) => !s)}
        onReset={handleReset}
      />

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
        <button
          className={`${styles.selectInput}`}
          style={{
            cursor: 'pointer',
            background: mode === 'encode' ? 'var(--color-accent-500)' : 'var(--color-bg-tertiary)',
            color: mode === 'encode' ? '#fff' : 'var(--color-text-secondary)',
          }}
          onClick={() => setMode('encode')}
        >
          Encode
        </button>
        <button
          className={`${styles.selectInput}`}
          style={{
            cursor: 'pointer',
            background: mode === 'decode' ? 'var(--color-accent-500)' : 'var(--color-bg-tertiary)',
            color: mode === 'decode' ? '#fff' : 'var(--color-text-secondary)',
          }}
          onClick={() => setMode('decode')}
        >
          Decode
        </button>
      </div>

      {/* Encode mode */}
      {mode === 'encode' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Hamming Encoder</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-unit-3)' }}>
              2^r ≥ m + r + 1
            </span>
          </div>

          <div className={styles.inputRow}>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-tertiary)', minWidth: 80 }}>Data bits:</span>
            <input
              type="text"
              value={dataBits}
              onChange={(e) => { setDataBits(e.target.value.replace(/[^01]/g, '')); setErrorPos(null); }}
              className={styles.textInput}
              maxLength={11}
              placeholder="e.g. 1011"
              aria-label="Data bits to encode"
            />
          </div>

          {/* Codeword visualization */}
          <div className={styles.posGrid}>
            {encodeResult.positionDetails.map((p) => (
              <div
                key={p.position}
                className={`${styles.posBit} ${p.isParity ? styles.posParity : styles.posData} ${errorPos === p.position ? styles.posError : ''}`}
                onClick={() => setErrorPos(errorPos === p.position ? null : p.position)}
                style={{ cursor: 'pointer' }}
                title={`Position ${p.position} — click to inject/remove error`}
              >
                <span>P{p.position}</span>
                <span>
                  {errorPos === p.position
                    ? (p.bitValue === '1' ? '0' : '1')
                    : p.bitValue}
                </span>
              </div>
            ))}
          </div>

          {errorPos && (
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-error)', fontWeight: 'var(--fw-bold)' }}>
              ⚠ Error injected at position {errorPos}. Codeword: {codewordWithError}
            </div>
          )}

          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-tertiary)' }}>
            Click any position to inject/remove a single-bit error for testing
          </div>

          {/* Auto-decode error injection */}
          {errorPos && (
            <div className={styles.resultBox} style={{ textAlign: 'center' }}>
              <div className={styles.resultLabel}>Syndrome (error detection)</div>
              <div style={{
                fontWeight: 'var(--fw-bold)',
                fontFamily: 'var(--font-mono)',
                color: decodeResult.hasError ? 'var(--color-error)' : 'var(--color-success)',
              }}>
                Syndrome = {decodeResult.syndromeBits} → {decodeResult.hasError ? `Error at position ${decodeResult.errorPosition}` : 'No error'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Decode mode */}
      {mode === 'decode' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Hamming Decoder</span>
          </div>

          <div className={styles.inputRow}>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-tertiary)', minWidth: 80 }}>
              Received:
            </span>
            <input
              type="text"
              value={receivedBits}
              onChange={(e) => setReceivedBits(e.target.value.replace(/[^01]/g, ''))}
              className={styles.textInput}
              maxLength={20}
              placeholder={`e.g. ${encodeResult.codeword}`}
              aria-label="Received codeword"
            />
          </div>

          {decodeInput.length > 0 && (
            <>
              <div className={styles.posGrid}>
                {decodeInput.split('').map((bit, i) => {
                  const pos = i + 1;
                  const isParity = (pos & (pos - 1)) === 0;
                  const isErrorPos = decodeResult.hasError && decodeResult.errorPosition === pos;
                  return (
                    <div
                      key={pos}
                      className={`${styles.posBit} ${isErrorPos ? styles.posError : isParity ? styles.posParity : styles.posData}`}
                    >
                      <span>P{pos}</span>
                      <span>{bit}</span>
                    </div>
                  );
                })}
              </div>

              <div className={styles.resultBox} style={{ textAlign: 'center' }}>
                <div className={styles.resultLabel}>Syndrome</div>
                <div className={styles.resultVal} style={{ fontSize: 'var(--fs-md)' }}>
                  {decodeResult.syndromeBits} (decimal: {decodeResult.errorPosition})
                </div>
                <div style={{
                  color: decodeResult.hasError ? 'var(--color-error)' : 'var(--color-success)',
                  fontWeight: 'var(--fw-bold)', marginTop: 4,
                }}>
                  {decodeResult.hasError
                    ? `Error at position ${decodeResult.errorPosition} → corrected codeword: ${decodeResult.correctedCodeword}`
                    : '✅ No error detected'}
                </div>
              </div>

              <div className={styles.resultBox} style={{ textAlign: 'center' }}>
                <div className={styles.resultLabel}>Extracted Data</div>
                <div className={styles.resultVal}>{decodeResult.extractedData}</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
