import { useState, useMemo, useCallback } from 'react';
import { pcm } from '../../lib/signals';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './Sampling.module.css';

export function Sampling() {
  const [signalFreq, setSignalFreq] = useState<number>(2); // 2 Hz signal
  const [sampleRate, setSampleRate] = useState<number>(8); // 8 Hz sampling
  const [quantBits, setQuantBits] = useState<number>(3); // 3 bits = 8 levels
  const [showSteps, setShowSteps] = useState<boolean>(false);

  const nyquistRate = signalFreq * 2;
  const isAliasing = sampleRate < nyquistRate;
  // Apparent aliased frequency: |fs - f_sig|
  const apparentAliasedFreq = isAliasing ? Math.abs(sampleRate - signalFreq) : signalFreq;

  const handleReset = useCallback(() => {
    setSignalFreq(2);
    setSampleRate(8);
    setQuantBits(3);
  }, []);

  // PCM computation
  const duration = 1.0; // 1 second view
  const pcmResult = useMemo(() => {
    const sig = (t: number) => Math.sin(2 * Math.PI * signalFreq * t);
    return pcm(sig, sampleRate, duration, quantBits, 1.0);
  }, [signalFreq, sampleRate, quantBits]);

  // SVG dimensions
  const svgWidth = 620;
  const svgHeight = 220;
  const centerY = svgHeight / 2;
  const ampScale = 80; // 80px per unit amplitude

  // Continuous original wave path
  const originalWavePath = useMemo(() => {
    const steps = 200;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * duration;
      const x = (i / steps) * svgWidth;
      const yVal = Math.sin(2 * Math.PI * signalFreq * t);
      const y = centerY - yVal * ampScale;
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return d;
  }, [signalFreq, duration, svgWidth, centerY, ampScale]);

  // Aliased false reconstructed curve (if undersampled)
  const aliasedWavePath = useMemo(() => {
    if (!isAliasing) return '';
    const steps = 200;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * duration;
      const x = (i / steps) * svgWidth;
      const yVal = Math.sin(2 * Math.PI * apparentAliasedFreq * t);
      const y = centerY - yVal * ampScale;
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return d;
  }, [isAliasing, apparentAliasedFreq, duration, svgWidth, centerY, ampScale]);

  // Quantized stair-step path
  const stairStepPath = useMemo(() => {
    let d = '';
    pcmResult.samples.forEach((s, idx) => {
      const x = (s.t / duration) * svgWidth;
      const y = centerY - s.quantizedValue * ampScale;
      const nextSample = pcmResult.samples[idx + 1];
      const nextX = nextSample ? (nextSample.t / duration) * svgWidth : svgWidth;

      if (idx === 0) {
        d += `M ${x} ${y} L ${nextX} ${y}`;
      } else {
        d += ` L ${x} ${y} L ${nextX} ${y}`;
      }
    });
    return d;
  }, [pcmResult.samples, duration, svgWidth, centerY, ampScale]);

  const explanation = (
    <div>
      <p style={{ margin: 0 }}>
        <strong>NYQUIST SAMPLING THEOREM (PCM): </strong>
        To accurately reconstruct an analog signal of highest frequency f_max, the sampling rate must be
        at least twice the highest frequency: <strong>f_s ≥ 2 × f_max</strong>.
        {isAliasing ? (
          <span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>
            {' '}CRITICAL: Currently undersampled! The sample rate ({sampleRate} Hz) is less than the Nyquist rate ({nyquistRate} Hz), causing frequency aliasing (appears as a false {apparentAliasedFreq} Hz wave!).
          </span>
        ) : (
          <span>
            {' '}Adequately sampled at {sampleRate} Hz (≥ {nyquistRate} Hz Nyquist limit). The original signal can be completely recovered without aliasing.
          </span>
        )}
      </p>
      <div style={{ marginTop: 'var(--sp-2)' }}>
        Quantization into <strong>{pcmResult.quantLevels} levels</strong> ({quantBits} bits) results in a digital bit rate of <strong>{pcmResult.bitRate} bps</strong>.
      </div>
    </div>
  );

  const steps = (
    <div>
      <div><strong>PCM Derivations:</strong></div>
      <div>• Nyquist Rate: f_s(min) = 2 × {signalFreq} Hz = <strong>{nyquistRate} Hz</strong></div>
      <div>• Actual Sampling Interval Ts = 1 / {sampleRate} = <strong>{(1 / sampleRate).toFixed(3)} s</strong></div>
      <div>• Quantization Levels: L = 2^{quantBits} = <strong>{pcmResult.quantLevels} levels</strong></div>
      <div>• Step Size Δ = 2V_max / L = 2.0 / {pcmResult.quantLevels} = <strong>{(2.0 / pcmResult.quantLevels).toFixed(3)} V</strong></div>
      <div>• Max Quantization Error: Δ / 2 = <strong>{(1.0 / pcmResult.quantLevels).toFixed(3)} V</strong></div>
      <div>• Resulting Transmission Bit Rate: R_b = f_s × n = {sampleRate} × {quantBits} = <strong>{pcmResult.bitRate} bps</strong></div>
      <div>• Theoretical SNR = 6.02 × {quantBits} + 1.76 = <strong>{pcmResult.snrDbEstimated.toFixed(2)} dB</strong></div>
    </div>
  );

  return (
    <div className={styles.container}>
      <SimControls
        title="Pulse Code Modulation (PCM) &amp; Nyquist Sampler"
        explanation={explanation}
        steps={steps}
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((s) => !s)}
        onReset={handleReset}
      >
        <div className={styles.controlsGrid} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.controlCard}>
            <div className={styles.controlLabel}>
              <span>Analog Signal Freq (f):</span>
              <span>{signalFreq} Hz</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={signalFreq}
              onChange={(e) => setSignalFreq(parseInt(e.target.value, 10))}
              className={styles.sliderInput}
              aria-label="Signal frequency"
            />
          </div>

          <div className={styles.controlCard}>
            <div className={styles.controlLabel}>
              <span>Sampling Rate (f_s):</span>
              <span style={{ color: isAliasing ? 'var(--color-error)' : 'var(--color-success)', fontWeight: 'bold' }}>
                {sampleRate} Hz {isAliasing ? '(Aliased!)' : '(Valid)'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={sampleRate}
              onChange={(e) => setSampleRate(parseInt(e.target.value, 10))}
              className={styles.sliderInput}
              aria-label="Sampling rate"
            />
          </div>

          <div className={styles.controlCard}>
            <div className={styles.controlLabel}>
              <span>Quantization Bits:</span>
              <span>{quantBits} bits ({Math.pow(2, quantBits)} levels)</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={quantBits}
              onChange={(e) => setQuantBits(parseInt(e.target.value, 10))}
              className={styles.sliderInput}
              aria-label="Quantization bits"
            />
          </div>
        </div>
      </SimControls>

      {/* Aliasing Alert */}
      {isAliasing && (
        <div className={styles.aliasingAlert} role="alert">
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <strong>Aliasing Detected!</strong> Sampling rate ({sampleRate} Hz) is less than the required Nyquist rate ({nyquistRate} Hz). High frequencies wrap around and masquerade as an alias signal of {apparentAliasedFreq} Hz (shown in red dashed line)!
          </div>
        </div>
      )}

      {/* Metrics Bar */}
      <div className={styles.readoutGrid}>
        <div className={styles.readoutCard}>
          <div className={styles.readoutVal}>{nyquistRate} Hz</div>
          <div className={styles.readoutLabel}>Nyquist Limit (2 × f)</div>
        </div>
        <div className={styles.readoutCard}>
          <div className={styles.readoutVal}>{pcmResult.bitRate} bps</div>
          <div className={styles.readoutLabel}>Digital Bit Rate (f_s × n)</div>
        </div>
        <div className={styles.readoutCard}>
          <div className={styles.readoutVal}>{pcmResult.quantLevels}</div>
          <div className={styles.readoutLabel}>Quantization Levels (2^n)</div>
        </div>
        <div className={styles.readoutCard}>
          <div className={styles.readoutVal}>{pcmResult.snrDbEstimated.toFixed(1)} dB</div>
          <div className={styles.readoutLabel}>Quantization SNR (dB)</div>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legendBar}>
        <span className={styles.legendItem}>
          <span style={{ width: 14, height: 2, background: 'var(--color-accent-500)', display: 'inline-block' }} />
          Original Analog Wave
        </span>
        <span className={styles.legendItem}>
          <span style={{ width: 14, height: 2, background: '#8b5cf6', display: 'inline-block' }} />
          Quantized Stair-Step
        </span>
        <span className={styles.legendItem}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-unit-2)', display: 'inline-block' }} />
          Discrete Samples
        </span>
        {isAliasing && (
          <span className={styles.legendItem} style={{ color: 'var(--color-error)' }}>
            <span style={{ width: 14, height: 2, background: 'var(--color-error)', display: 'inline-block', borderBottom: '1px dashed' }} />
            Aliased Ghost Frequency ({apparentAliasedFreq} Hz)
          </span>
        )}
      </div>

      {/* Sampling & Quantization SVG Canvas */}
      <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '6px', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label="PCM sampling and quantization waveform diagram"
        >
          {/* Horizontal Quantization Level Grid Lines */}
          {Array.from({ length: pcmResult.quantLevels }).map((_, idx) => {
            const v = -1.0 + ((idx + 0.5) * 2.0) / pcmResult.quantLevels;
            const y = centerY - v * ampScale;
            return (
              <g key={idx}>
                <line
                  x1="0"
                  y1={y}
                  x2={svgWidth}
                  y2={y}
                  stroke="var(--color-border)"
                  strokeDasharray="2 4"
                  opacity="0.5"
                />
              </g>
            );
          })}

          {/* Zero Axis */}
          <line x1="0" y1={centerY} x2={svgWidth} y2={centerY} stroke="var(--color-border-strong)" strokeWidth="1" />

          {/* Original Analog Continuous Signal */}
          <path d={originalWavePath} fill="none" stroke="var(--color-accent-500)" strokeWidth="2.5" />

          {/* Aliased wave (if undersampled) */}
          {isAliasing && (
            <path d={aliasedWavePath} fill="none" stroke="var(--color-error)" strokeWidth="2" strokeDasharray="5 4" opacity="0.8" />
          )}

          {/* Quantized Stair-Step Signal */}
          <path d={stairStepPath} fill="none" stroke="#8b5cf6" strokeWidth="1.8" opacity="0.8" />

          {/* Sample Stems and Sample Points */}
          {pcmResult.samples.map((s, idx) => {
            const x = (s.t / duration) * svgWidth;
            const yAnalog = centerY - s.analogValue * ampScale;
            const yQuant = centerY - s.quantizedValue * ampScale;

            return (
              <g key={idx}>
                {/* Vertical impulse stem */}
                <line
                  x1={x}
                  y1={centerY}
                  x2={x}
                  y2={yAnalog}
                  stroke="var(--color-unit-2)"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
                {/* Quantization error bar */}
                <line
                  x1={x + 3}
                  y1={yAnalog}
                  x2={x + 3}
                  y2={yQuant}
                  stroke="var(--color-warning)"
                  strokeWidth="2"
                />
                {/* Sample Point dot */}
                <circle
                  cx={x}
                  cy={yAnalog}
                  r="4"
                  fill="var(--color-unit-2)"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
                {/* Binary Code Label */}
                <text
                  x={x}
                  y={yQuant > centerY ? yQuant + 12 : yQuant - 6}
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="var(--color-text-secondary)"
                >
                  {s.binaryCode}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
