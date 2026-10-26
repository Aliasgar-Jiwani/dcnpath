import { useState, useMemo, useCallback } from 'react';
import {
  modulateDigital,
  analogAm,
  analogFm,
  QAM4_POINTS,
  QAM16_POINTS,
  type DigitalModScheme,
  type ConstellationPoint,
} from '../../lib/modulation';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './Modulation.module.css';

export function Modulation() {
  const [mode, setMode] = useState<'digital' | 'analog'>('digital');
  const [digitalScheme, setDigitalScheme] = useState<DigitalModScheme>('4-QAM');
  const [bits, setBits] = useState<string>('00011110');
  const [carrierFreq, setCarrierFreq] = useState<number>(4);
  const [bitRate, setBitRate] = useState<number>(1);

  // Analog mode states
  const [analogScheme, setAnalogScheme] = useState<'AM' | 'FM'>('AM');
  const [amIndex, setAmIndex] = useState<number>(0.8);
  const [fmBeta, setFmBeta] = useState<number>(3.0);
  const [fmCarrier, setFmCarrier] = useState<number>(16);
  const [msgFreq, setMsgFreq] = useState<number>(2);

  const [showSteps, setShowSteps] = useState<boolean>(false);

  const handleReset = useCallback(() => {
    setMode('digital');
    setDigitalScheme('4-QAM');
    setBits('00011110');
    setCarrierFreq(4);
    setBitRate(1);
    setAnalogScheme('AM');
    setAmIndex(0.8);
    setFmBeta(3.0);
    setFmCarrier(16);
    setMsgFreq(2);
  }, []);

  // Digital calculations
  const digitalResult = useMemo(() => {
    return modulateDigital(bits, digitalScheme, carrierFreq, bitRate);
  }, [bits, digitalScheme, carrierFreq, bitRate]);

  // Digital Waveform SVG path
  const waveWidth = 520;
  const waveHeight = 160;
  const waveCenterY = waveHeight / 2;
  const totalSymbols = digitalResult.symbols.length;
  const symbolWidth = totalSymbols > 0 ? waveWidth / totalSymbols : waveWidth;

  const digitalWavePath = useMemo(() => {
    const pointsPerSymbol = 40;
    let d = '';

    digitalResult.symbols.forEach((sym, symIdx) => {
      const symStartX = symIdx * symbolWidth;
      for (let p = 0; p <= pointsPerSymbol; p++) {
        const frac = p / pointsPerSymbol;
        const x = symStartX + frac * symbolWidth;
        const phaseRad = (sym.phaseDegrees * Math.PI) / 180;
        // Wave value: A * sin(2 * pi * f * frac + phase)
        const v = sym.amplitude * Math.sin(2 * Math.PI * sym.frequency * frac + phaseRad);
        const y = waveCenterY - v * 55;
        if (symIdx === 0 && p === 0) {
          d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        } else {
          d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      }
    });

    return d;
  }, [digitalResult.symbols, symbolWidth, waveCenterY]);

  // Constellation Reference Points
  const constellationPoints = useMemo<ConstellationPoint[]>(() => {
    if (digitalScheme === '4-QAM') return QAM4_POINTS;
    if (digitalScheme === '16-QAM') return QAM16_POINTS;
    if (digitalScheme === 'BPSK') {
      return [
        { symbolBits: '0', i: 1, q: 0, phaseDegrees: 0, magnitude: 1 },
        { symbolBits: '1', i: -1, q: 0, phaseDegrees: 180, magnitude: 1 },
      ];
    }
    if (digitalScheme === 'ASK') {
      return [
        { symbolBits: '0', i: 0.2, q: 0, phaseDegrees: 0, magnitude: 0.2 },
        { symbolBits: '1', i: 1.0, q: 0, phaseDegrees: 0, magnitude: 1.0 },
      ];
    }
    return [];
  }, [digitalScheme]);

  // Analog Waveform paths
  const analogWaveWidth = 520;
  const analogWaveHeight = 160;
  const analogCenterY = analogWaveHeight / 2;

  const analogPaths = useMemo(() => {
    const numPoints = 300;
    const duration = 1.0;
    let modPath = '';
    let envTop = '';
    let envBot = '';

    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * duration;
      const x = (i / numPoints) * analogWaveWidth;

      if (analogScheme === 'AM') {
        const res = analogAm(t, fmCarrier, msgFreq, amIndex, 1.0);
        const y = analogCenterY - res.modulated * 45;
        const yEnvTop = analogCenterY - res.envelope * 45;
        const yEnvBot = analogCenterY + res.envelope * 45;

        if (i === 0) {
          modPath += `M ${x} ${y}`;
          envTop += `M ${x} ${yEnvTop}`;
          envBot += `M ${x} ${yEnvBot}`;
        } else {
          modPath += ` L ${x} ${y}`;
          envTop += ` L ${x} ${yEnvTop}`;
          envBot += ` L ${x} ${yEnvBot}`;
        }
      } else {
        const res = analogFm(t, fmCarrier, msgFreq, fmBeta, 1.0);
        const y = analogCenterY - res.modulated * 55;
        if (i === 0) {
          modPath += `M ${x} ${y}`;
        } else {
          modPath += ` L ${x} ${y}`;
        }
      }
    }

    return { modPath, envTop, envBot };
  }, [analogScheme, fmCarrier, msgFreq, amIndex, fmBeta]);

  const explanation = (
    <div>
      {mode === 'digital' ? (
        <p style={{ margin: 0 }}>
          <strong>DIGITAL MODULATION ({digitalScheme}): </strong>
          Translates digital bits into analog radio frequency (RF) carrier signals.
          {digitalScheme === 'ASK' && ' Modulates carrier amplitude (voltage height).'}
          {digitalScheme === 'FSK' && ' Modulates carrier frequency (cycles per second).'}
          {digitalScheme === 'BPSK' && ' Modulates carrier phase (180° shift for bit 1).'}
          {(digitalScheme === '4-QAM' || digitalScheme === '16-QAM') &&
            ` Combines both amplitude and phase modulation on orthogonal In-phase (I) and Quadrature (Q) carriers to achieve high spectral efficiency (${digitalResult.bitsPerSymbol} bits/baud).`}
        </p>
      ) : (
        <p style={{ margin: 0 }}>
          <strong>ANALOG MODULATION ({analogScheme}): </strong>
          {analogScheme === 'AM' &&
            `Amplitude Modulation varies the carrier amplitude proportionally to the baseband message. Modulation index μ = ${amIndex}${amIndex > 1 ? ' (OVER-MODULATION! Causes envelope distortion at zero-crossings)' : ' (linear envelope)'}.`}
          {analogScheme === 'FM' &&
            `Frequency Modulation varies the instantaneous frequency while keeping amplitude constant (resistant to noise spikes!). Modulation index β = ${fmBeta}.`}
        </p>
      )}
    </div>
  );

  const steps = (
    <div>
      {mode === 'digital' ? (
        <div>
          <div>• Bits: <code>{bits}</code> (Length: {bits.length})</div>
          <div>• Symbol Bit Chunk Size: {digitalResult.bitsPerSymbol} bits/symbol</div>
          <div>• Baud Rate: {digitalResult.baudRate} symbols/sec</div>
          <div>• Constellation Points: {constellationPoints.length} states on IQ plane</div>
        </div>
      ) : (
        <div>
          <div>• Carrier Frequency: {fmCarrier} Hz | Message Frequency: {msgFreq} Hz</div>
          <div>• {analogScheme === 'AM' ? `AM Index μ = ${amIndex}` : `FM Index β = ${fmBeta}`}</div>
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Mode toggle */}
      <div className={styles.modeToggleBar}>
        <div className={styles.modeTabs}>
          <button
            className={`${styles.modeTab} ${mode === 'digital' ? styles.activeModeTab : ''}`}
            onClick={() => setMode('digital')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Digital Modulation</span>
          </button>
          <button
            className={`${styles.modeTab} ${mode === 'analog' ? styles.activeModeTab : ''}`}
            onClick={() => setMode('analog')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12c3-6 6-6 9 0s6 6 9 0" />
            </svg>
            <span>Analog Modulation</span>
          </button>
        </div>
      </div>

      {/* Controls Panel */}
      <SimControls
        title={mode === 'digital' ? `Digital Modulation: ${digitalScheme}` : `Analog Modulation: ${analogScheme}`}
        explanation={explanation}
        steps={steps}
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((s) => !s)}
        onReset={handleReset}
      >
        {mode === 'digital' ? (
          <>
            <div className={styles.controlCard}>
              <div className={styles.controlLabel}>
                <span>Scheme:</span>
              </div>
              <select
                value={digitalScheme}
                onChange={(e) => setDigitalScheme(e.target.value as DigitalModScheme)}
                style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', padding: '6px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--fs-xs)' }}
              >
                <option value="ASK">ASK (Amplitude Shift)</option>
                <option value="FSK">FSK (Frequency Shift)</option>
                <option value="BPSK">BPSK (Phase Shift)</option>
                <option value="4-QAM">4-QAM (QPSK, 2 bits/baud)</option>
                <option value="16-QAM">16-QAM (4 bits/baud)</option>
              </select>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.controlLabel}>
                <span>Data Bits:</span>
              </div>
              <input
                type="text"
                value={bits}
                onChange={(e) => setBits(e.target.value.replace(/[^01]/g, ''))}
                maxLength={16}
                style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', padding: '6px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-sm)', letterSpacing: '0.1em' }}
              />
            </div>

            <div className={styles.controlCard}>
              <div className={styles.controlLabel}>
                <span>Carrier Freq:</span>
                <span>{carrierFreq} Hz</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                value={carrierFreq}
                onChange={(e) => setCarrierFreq(parseInt(e.target.value, 10))}
                className={styles.sliderInput}
              />
            </div>
          </>
        ) : (
          <>
            <div className={styles.controlCard}>
              <div className={styles.controlLabel}>
                <span>Scheme:</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  className={`${styles.modeTab} ${analogScheme === 'AM' ? styles.activeModeTab : ''}`}
                  onClick={() => setAnalogScheme('AM')}
                  style={{ fontSize: 'var(--fs-xs)', padding: '4px 14px' }}
                >
                  AM
                </button>
                <button
                  className={`${styles.modeTab} ${analogScheme === 'FM' ? styles.activeModeTab : ''}`}
                  onClick={() => setAnalogScheme('FM')}
                  style={{ fontSize: 'var(--fs-xs)', padding: '4px 14px' }}
                >
                  FM
                </button>
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.controlLabel}>
                <span>{analogScheme === 'AM' ? 'Modulation Index (μ):' : 'Modulation Index (β):'}</span>
                <span>{analogScheme === 'AM' ? amIndex : fmBeta}</span>
              </div>
              <input
                type="range"
                min={analogScheme === 'AM' ? '0.2' : '1'}
                max={analogScheme === 'AM' ? '1.5' : '6'}
                step={analogScheme === 'AM' ? '0.1' : '0.5'}
                value={analogScheme === 'AM' ? amIndex : fmBeta}
                onChange={(e) =>
                  analogScheme === 'AM'
                    ? setAmIndex(parseFloat(e.target.value))
                    : setFmBeta(parseFloat(e.target.value))
                }
                className={styles.sliderInput}
              />
            </div>

            <div className={styles.controlCard}>
              <div className={styles.controlLabel}>
                <span>Message Freq (fm):</span>
                <span>{msgFreq} Hz</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={msgFreq}
                onChange={(e) => setMsgFreq(parseInt(e.target.value, 10))}
                className={styles.sliderInput}
              />
            </div>
          </>
        )}
      </SimControls>

      {/* ─── Dashboard Grid: Waveform + Constellation/Specs ─── */}
      <div className={styles.dashboardGrid}>
        {/* Modulated Waveform */}
        <div className={styles.viewCard}>
          <div className={styles.viewHeader}>
            <span className={styles.viewTitle}>
              {mode === 'digital'
                ? `RF Modulated Waveform (${digitalResult.symbols.length} Symbols)`
                : `Modulated RF Signal s(t)`}
            </span>
          </div>

          <div className={styles.svgContainer}>
            <svg
              viewBox={`0 0 ${waveWidth} ${waveHeight}`}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              role="img"
              aria-label="Modulated carrier waveform"
            >
              <line x1="0" y1={waveCenterY} x2={waveWidth} y2={waveCenterY} stroke="var(--color-border-strong)" strokeWidth="1" />

              {mode === 'digital' ? (
                <>
                  {/* Symbol boundary grid lines */}
                  {digitalResult.symbols.map((sym, idx) => (
                    <g key={idx}>
                      <line
                        x1={idx * symbolWidth}
                        y1="0"
                        x2={idx * symbolWidth}
                        y2={waveHeight}
                        stroke="var(--color-border)"
                        strokeDasharray="2 3"
                      />
                      <text
                        x={idx * symbolWidth + symbolWidth / 2}
                        y={waveHeight - 6}
                        textAnchor="middle"
                        fontSize="11"
                        fontFamily="var(--font-mono)"
                        fontWeight="bold"
                        fill="var(--color-accent-500)"
                      >
                        {sym.bits}
                      </text>
                    </g>
                  ))}
                  <path d={digitalWavePath} fill="none" stroke="var(--color-accent-500)" strokeWidth="2.5" />
                </>
              ) : (
                <>
                  {analogScheme === 'AM' && (
                    <>
                      {/* AM Envelope lines */}
                      <path d={analogPaths.envTop} fill="none" stroke="var(--color-unit-2)" strokeWidth="1.5" strokeDasharray="3 3" />
                      <path d={analogPaths.envBot} fill="none" stroke="var(--color-unit-2)" strokeWidth="1.5" strokeDasharray="3 3" />
                    </>
                  )}
                  <path d={analogPaths.modPath} fill="none" stroke="var(--color-accent-500)" strokeWidth="2" />
                </>
              )}
            </svg>
          </div>

          {/* Symbol mapping table in digital mode */}
          {mode === 'digital' && (
            <div className={styles.tableWrapper}>
              <table className={styles.mappingTable}>
                <thead>
                  <tr>
                    <th>Sym #</th>
                    <th>Bits</th>
                    <th>Amplitude</th>
                    <th>Frequency</th>
                    <th>Phase</th>
                    <th>I (In-phase)</th>
                    <th>Q (Quad)</th>
                  </tr>
                </thead>
                <tbody>
                  {digitalResult.symbols.map((s) => (
                    <tr key={s.symbolIndex}>
                      <td>#{s.symbolIndex + 1}</td>
                      <td><strong>{s.bits}</strong></td>
                      <td>{s.amplitude.toFixed(2)}</td>
                      <td>{s.frequency} Hz</td>
                      <td>{s.phaseDegrees}°</td>
                      <td>{s.constellation.i}</td>
                      <td>{s.constellation.q}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 2D Constellation Diagram (Digital) or AM/FM Specs (Analog) */}
        <div className={styles.viewCard}>
          <div className={styles.viewHeader}>
            <span className={styles.viewTitle}>
              {mode === 'digital' ? 'Constellation Diagram (I vs Q)' : 'Spectral Properties'}
            </span>
          </div>

          {mode === 'digital' ? (
            <div className={styles.svgContainer} style={{ display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 220 220" style={{ width: '100%', maxWidth: '240px', height: 'auto' }} role="img" aria-label="Constellation diagram">
                {/* Axes */}
                <line x1="20" y1="110" x2="200" y2="110" stroke="var(--color-border-strong)" strokeWidth="1.5" />
                <line x1="110" y1="20" x2="110" y2="200" stroke="var(--color-border-strong)" strokeWidth="1.5" />
                <text x="195" y="105" fontSize="10" fill="var(--color-text-tertiary)">+I</text>
                <text x="115" y="28" fontSize="10" fill="var(--color-text-tertiary)">+Q</text>

                {/* Concentric reference circles */}
                <circle cx="110" cy="110" r="45" fill="none" stroke="var(--color-border)" strokeDasharray="2 3" opacity="0.6" />
                <circle cx="110" cy="110" r="75" fill="none" stroke="var(--color-border)" strokeDasharray="2 3" opacity="0.6" />

                {/* Constellation points */}
                {constellationPoints.map((pt, idx) => {
                  const scale = digitalScheme === '16-QAM' ? 20 : 50;
                  const cx = 110 + pt.i * scale;
                  const cy = 110 - pt.q * scale;
                  const isCurrent = digitalResult.symbols.some((s) => s.bits === pt.symbolBits);

                  return (
                    <g key={idx}>
                      {isCurrent && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="12"
                          fill="none"
                          stroke="var(--color-accent-500)"
                          strokeWidth="1"
                          opacity="0.3"
                        >
                          <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isCurrent ? 7 : 4}
                        fill={isCurrent ? 'var(--color-accent-500)' : 'var(--color-text-tertiary)'}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text
                        x={cx}
                        y={cy - 9}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fill={isCurrent ? 'var(--color-accent-500)' : 'var(--color-text-secondary)'}
                      >
                        {pt.symbolBits}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className={styles.specPanel}>
              <strong>Bandwidth Requirements:</strong>
              {analogScheme === 'AM' ? (
                <div style={{ marginTop: 'var(--sp-2)' }}>
                  <div>AM Bandwidth: B = 2 × f<sub>m</sub> = 2 × {msgFreq}</div>
                  <div className={styles.specHighlight} style={{ marginTop: 'var(--sp-2)' }}>
                    B = {2 * msgFreq} Hz
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 'var(--sp-2)' }}>
                  <div>Carson&apos;s Rule: B = 2(β + 1) × f<sub>m</sub></div>
                  <div>= 2 × ({fmBeta} + 1) × {msgFreq}</div>
                  <div className={styles.specHighlight} style={{ marginTop: 'var(--sp-2)' }}>
                    B = {2 * (fmBeta + 1) * msgFreq} Hz
                  </div>
                </div>
              )}
              <div className={styles.specNote}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>FM requires greater transmission bandwidth than AM, but provides superior resistance to amplitude noise and fading.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
