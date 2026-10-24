import React, { useState, useMemo, useCallback } from 'react';
import {
  calculateBandwidth,
  sineValue,
  compositeSineValue,
  type SineComponent,
} from '../../lib/signals';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './SignalViewer.module.css';

interface SignalComponentState extends SineComponent {
  id: string;
  enabled: boolean;
  color: string;
}

const DEFAULT_COMPONENTS: SignalComponentState[] = [
  { id: 'c1', amplitude: 3.0, frequency: 1, phase: 0, enabled: true, color: '#3b82f6' },
  { id: 'c2', amplitude: 1.0, frequency: 3, phase: 0, enabled: true, color: '#10b981' },
  { id: 'c3', amplitude: 0.6, frequency: 5, phase: 0, enabled: true, color: '#f59e0b' },
];

export function SignalViewer() {
  const [components, setComponents] = useState<SignalComponentState[]>(DEFAULT_COMPONENTS);
  const [showSteps, setShowSteps] = useState<boolean>(false);

  const activeComponents = useMemo(
    () => components.filter((c) => c.enabled),
    [components]
  );

  const bandwidthInfo = useMemo(
    () => calculateBandwidth(activeComponents),
    [activeComponents]
  );

  const updateComponent = (
    id: string,
    field: keyof SineComponent | 'enabled',
    value: number | boolean
  ) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleReset = useCallback(() => {
    setComponents(DEFAULT_COMPONENTS);
  }, []);

  // Presets
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'square':
        // Fourier square wave: 1st, 3rd, 5th harmonics (1/1, 1/3, 1/5)
        setComponents([
          { id: 'c1', amplitude: 3.0, frequency: 1, phase: 0, enabled: true, color: '#3b82f6' },
          { id: 'c2', amplitude: 1.0, frequency: 3, phase: 0, enabled: true, color: '#10b981' },
          { id: 'c3', amplitude: 0.6, frequency: 5, phase: 0, enabled: true, color: '#f59e0b' },
        ]);
        break;
      case 'beats':
        // Two close frequencies
        setComponents([
          { id: 'c1', amplitude: 2.5, frequency: 4, phase: 0, enabled: true, color: '#3b82f6' },
          { id: 'c2', amplitude: 2.5, frequency: 5, phase: 0, enabled: true, color: '#10b981' },
          { id: 'c3', amplitude: 0, frequency: 1, phase: 0, enabled: false, color: '#f59e0b' },
        ]);
        break;
      case 'pure':
        setComponents([
          { id: 'c1', amplitude: 3.5, frequency: 2, phase: 0, enabled: true, color: '#3b82f6' },
          { id: 'c2', amplitude: 1.0, frequency: 4, phase: 0, enabled: false, color: '#10b981' },
          { id: 'c3', amplitude: 1.0, frequency: 6, phase: 0, enabled: false, color: '#f59e0b' },
        ]);
        break;
    }
  };

  // Generate SVG path for Time-Domain Plot
  // Canvas width: 500, height: 240, Center Y = 120
  const timePlotWidth = 500;
  const timePlotHeight = 220;
  const timeCenterY = timePlotHeight / 2;
  const timeScaleY = 20; // 20px per Volt
  const timeDuration = 2.0; // seconds

  const componentPaths = useMemo(() => {
    const numPoints = 200;
    return activeComponents.map((comp) => {
      let d = '';
      for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * timeDuration;
        const x = (i / numPoints) * timePlotWidth;
        const yVal = sineValue(comp, t);
        const y = timeCenterY - yVal * timeScaleY;
        d += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      return { id: comp.id, color: comp.color, d, name: `f=${comp.frequency}Hz` };
    });
  }, [activeComponents, timeCenterY, timePlotWidth, timeScaleY]);

  const compositePath = useMemo(() => {
    const numPoints = 250;
    let d = '';
    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * timeDuration;
      const x = (i / numPoints) * timePlotWidth;
      const yVal = compositeSineValue(activeComponents, t);
      const y = timeCenterY - yVal * timeScaleY;
      d += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  }, [activeComponents, timeCenterY, timePlotWidth, timeScaleY]);

  // Frequency-domain spectrum coordinates
  // Canvas width: 300, height: 220
  const freqPlotWidth = 300;
  const freqPlotHeight = 220;
  const maxFreqAxis = 8; // Hz
  const maxAmpAxis = 5; // V

  const spectralLines = useMemo(() => {
    return activeComponents.map((comp) => {
      const x = 35 + (comp.frequency / maxFreqAxis) * (freqPlotWidth - 55);
      const barHeight = (comp.amplitude / maxAmpAxis) * (freqPlotHeight - 50);
      const y = freqPlotHeight - 25 - barHeight;
      return {
        id: comp.id,
        freq: comp.frequency,
        amp: comp.amplitude,
        color: comp.color,
        x,
        y,
        barHeight,
      };
    });
  }, [activeComponents]);

  const explanation = (
    <div>
      <p style={{ margin: 0 }}>
        <strong>FOURIER ANALYSIS &amp; COMPOSITE SIGNALS: </strong>
        According to Fourier analysis, any composite signal is a combination of simple sine waves
        with different frequencies, amplitudes, and phases.
        {activeComponents.length > 1
          ? ` Notice how combining ${activeComponents.length} sine waves creates a complex non-sinusoidal periodic waveform in the time domain, but decomposes into discrete vertical spikes in the frequency domain!`
          : ' A single pure sine wave occupies only a single discrete frequency in the spectrum.'}
      </p>
      <div style={{ marginTop: 'var(--sp-2)', fontWeight: 'var(--fw-semibold)' }}>
        Bandwidth: {bandwidthInfo.bandwidth} Hz (Highest frequency {bandwidthInfo.maxFreq} Hz − Lowest frequency {bandwidthInfo.minFreq} Hz)
      </div>
    </div>
  );

  const steps = (
    <div>
      <div><strong>Instantaneous Composite Signal Formula:</strong></div>
      <div style={{ margin: '4px 0', color: 'var(--color-accent-500)' }}>
        s(t) = {activeComponents.map((c) => `${c.amplitude}·sin(2π·${c.frequency}·t + ${c.phase}°)`).join(' + ') || '0'}
      </div>
      <div>• Time domain view: Shows amplitude variation across time t [0.0s to 2.0s].</div>
      <div>• Frequency domain view: Shows discrete frequency spectral lines and their peak amplitudes.</div>
      <div>• Channel Bandwidth needed: B = f_max − f_min = {bandwidthInfo.maxFreq} − {bandwidthInfo.minFreq} = <strong>{bandwidthInfo.bandwidth} Hz</strong>.</div>
    </div>
  );

  return (
    <div className={styles.container}>
      <SimControls
        title="Signal &amp; Fourier Spectrum Viewer"
        explanation={explanation}
        steps={steps}
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((s) => !s)}
        onReset={handleReset}
      >
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-1)' }}>
            Preset Signal Configurations:
          </div>
          <div className={styles.presetsRow}>
            <button className={styles.presetBtn} onClick={() => applyPreset('square')}>
              Square Wave Synthesis (1st + 3rd + 5th)
            </button>
            <button className={styles.presetBtn} onClick={() => applyPreset('beats')}>
              Beat Frequencies (4 Hz &amp; 5 Hz)
            </button>
            <button className={styles.presetBtn} onClick={() => applyPreset('pure')}>
              Pure Tone (Single 2 Hz)
            </button>
          </div>
        </div>
      </SimControls>

      {/* Component Sliders */}
      <div className={styles.componentsRow}>
        {components.map((comp, idx) => (
          <div key={comp.id} className={styles.compCard}>
            <div className={styles.compHeader}>
              <span className={styles.compTitle}>
                <span className={styles.colorDot} style={{ background: comp.color }} />
                Sine Wave {idx + 1}
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={comp.enabled}
                  onChange={(e) => updateComponent(comp.id, 'enabled', e.target.checked)}
                />
                Active
              </label>
            </div>

            <div className={styles.sliderControl}>
              <div className={styles.sliderLabelRow}>
                <span className={styles.sliderLabel}>Amplitude (A)</span>
                <span className={styles.sliderVal}>{comp.amplitude} V</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={comp.amplitude}
                disabled={!comp.enabled}
                onChange={(e) => updateComponent(comp.id, 'amplitude', parseFloat(e.target.value))}
                className={styles.sliderInput}
                aria-label={`Sine Wave ${idx + 1} Amplitude`}
              />
            </div>

            <div className={styles.sliderControl}>
              <div className={styles.sliderLabelRow}>
                <span className={styles.sliderLabel}>Frequency (f)</span>
                <span className={styles.sliderVal}>{comp.frequency} Hz</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={comp.frequency}
                disabled={!comp.enabled}
                onChange={(e) => updateComponent(comp.id, 'frequency', parseInt(e.target.value, 10))}
                className={styles.sliderInput}
                aria-label={`Sine Wave ${idx + 1} Frequency`}
              />
            </div>

            <div className={styles.sliderControl}>
              <div className={styles.sliderLabelRow}>
                <span className={styles.sliderLabel}>Phase (φ)</span>
                <span className={styles.sliderVal}>{comp.phase}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="15"
                value={comp.phase}
                disabled={!comp.enabled}
                onChange={(e) => updateComponent(comp.id, 'phase', parseInt(e.target.value, 10))}
                className={styles.sliderInput}
                aria-label={`Sine Wave ${idx + 1} Phase`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Readout Metrics */}
      <div className={styles.readoutGrid}>
        <div className={styles.readoutCard}>
          <div className={styles.readoutVal}>{bandwidthInfo.bandwidth} Hz</div>
          <div className={styles.readoutLabel}>Signal Bandwidth (B)</div>
        </div>
        <div className={styles.readoutCard}>
          <div className={styles.readoutVal}>{bandwidthInfo.minFreq} Hz</div>
          <div className={styles.readoutLabel}>Lowest Frequency (f_min)</div>
        </div>
        <div className={styles.readoutCard}>
          <div className={styles.readoutVal}>{bandwidthInfo.maxFreq} Hz</div>
          <div className={styles.readoutLabel}>Highest Frequency (f_max)</div>
        </div>
        <div className={styles.readoutCard}>
          <div className={styles.readoutVal}>{activeComponents.length}</div>
          <div className={styles.readoutLabel}>Active Harmonics</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Time-Domain Waveform */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>Time Domain: Amplitude vs Time v(t)</span>
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span style={{ width: 12, height: 3, background: 'var(--color-accent-500)', display: 'inline-block' }} />
                Composite
              </span>
            </div>
          </div>
          <svg viewBox={`0 0 ${timePlotWidth} ${timePlotHeight}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="Time domain signal waveform">
            {/* Grid & Axis */}
            <line x1="0" y1={timeCenterY} x2={timePlotWidth} y2={timeCenterY} stroke="var(--color-border-strong)" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="0" y2={timePlotHeight} stroke="var(--color-border-strong)" strokeWidth="1.5" />

            {/* Individual components (dashed lines) */}
            {componentPaths.map((cp) => (
              <path
                key={cp.id}
                d={cp.d}
                fill="none"
                stroke={cp.color}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.75"
              />
            ))}

            {/* Composite signal (solid thick line) */}
            <path
              d={compositePath}
              fill="none"
              stroke="var(--color-accent-500)"
              strokeWidth="2.8"
            />
          </svg>
        </div>

        {/* Frequency-Domain Spectrum */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>Frequency Domain: Spectrum |A(f)|</span>
          </div>
          <svg viewBox={`0 0 ${freqPlotWidth} ${freqPlotHeight}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="Frequency domain discrete spectrum bar chart">
            {/* Axis */}
            <line x1="30" y1={freqPlotHeight - 25} x2={freqPlotWidth} y2={freqPlotHeight - 25} stroke="var(--color-border-strong)" strokeWidth="1.5" />
            <line x1="30" y1="10" x2="30" y2={freqPlotHeight - 25} stroke="var(--color-border-strong)" strokeWidth="1.5" />

            {/* X-axis labels (Frequency Hz) */}
            {[1, 2, 3, 4, 5, 6, 7].map((f) => {
              const x = 35 + (f / maxFreqAxis) * (freqPlotWidth - 55);
              return (
                <g key={f}>
                  <line x1={x} y1={freqPlotHeight - 25} x2={x} y2={freqPlotHeight - 20} stroke="var(--color-text-tertiary)" />
                  <text x={x} y={freqPlotHeight - 8} fontSize="10" textAnchor="middle" fill="var(--color-text-tertiary)">
                    {f}Hz
                  </text>
                </g>
              );
            })}

            {/* Y-axis labels */}
            {[1, 3, 5].map((a) => {
              const y = freqPlotHeight - 25 - (a / maxAmpAxis) * (freqPlotHeight - 50);
              return (
                <g key={a}>
                  <text x="22" y={y + 4} fontSize="9" textAnchor="end" fill="var(--color-text-tertiary)">
                    {a}V
                  </text>
                </g>
              );
            })}

            {/* Spectral Lines */}
            {spectralLines.map((sp) => (
              <g key={sp.id}>
                {/* Vertical stem */}
                <line
                  x1={sp.x}
                  y1={freqPlotHeight - 25}
                  x2={sp.x}
                  y2={sp.y}
                  stroke={sp.color}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Dot at top */}
                <circle cx={sp.x} cy={sp.y} r="5" fill={sp.color} stroke="#ffffff" strokeWidth="1.5" />
                <text x={sp.x} y={sp.y - 8} fontSize="10" fontWeight="bold" textAnchor="middle" fill="var(--color-text-primary)">
                  {sp.amp}V
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
