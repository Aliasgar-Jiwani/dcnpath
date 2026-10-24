import { useState, useMemo, useCallback } from 'react';
import {
  shannon,
  nyquist,
  snrDbToLinear,
} from '../../lib/signals';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './ChannelCapacity.module.css';

export function ChannelCapacity() {
  // Shannon inputs
  const [shannonB, setShannonB] = useState<number>(3000); // 3000 Hz (telephone line)
  const [snrDb, setSnrDb] = useState<number>(30); // 30 dB

  // Nyquist inputs
  const [nyquistB, setNyquistB] = useState<number>(3000); // 3000 Hz
  const [levels, setLevels] = useState<number>(2); // 2 levels

  const [showSteps, setShowSteps] = useState<boolean>(false);

  const handleReset = useCallback(() => {
    setShannonB(3000);
    setSnrDb(30);
    setNyquistB(3000);
    setLevels(2);
  }, []);

  // Conversions & Calculations
  const snrLinear = useMemo(() => snrDbToLinear(snrDb), [snrDb]);
  const shannonCap = useMemo(() => shannon(shannonB, snrDb), [shannonB, snrDb]);
  const nyquistCap = useMemo(() => nyquist(nyquistB, levels), [nyquistB, levels]);

  // Format bps for humans
  const formatBps = (bps: number) => {
    if (bps >= 1e6) return `${(bps / 1e6).toFixed(2)} Mbps`;
    if (bps >= 1e3) return `${(bps / 1e3).toFixed(2)} kbps`;
    return `${Math.round(bps)} bps`;
  };

  // Generate Live SVG Curve: Shannon Capacity vs SNR (dB) for current Bandwidth
  // Canvas width: 500, height: 180
  const graphWidth = 500;
  const graphHeight = 180;
  const paddingLeft = 45;
  const paddingBottom = 30;
  const plotW = graphWidth - paddingLeft - 20;
  const plotH = graphHeight - paddingBottom - 20;

  const maxSnrGraph = 60; // 0 to 60 dB
  const maxCapGraph = shannon(shannonB, maxSnrGraph);

  const shannonCurveD = useMemo(() => {
    let d = '';
    const points = 50;
    for (let i = 0; i <= points; i++) {
      const db = (i / points) * maxSnrGraph;
      const cap = shannon(shannonB, db);
      const x = paddingLeft + (db / maxSnrGraph) * plotW;
      const y = graphHeight - paddingBottom - (cap / (maxCapGraph || 1)) * plotH;
      d += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  }, [shannonB, maxCapGraph, plotW, plotH, graphHeight, paddingLeft, paddingBottom]);

  // Current operating point on curve
  const currentPt = useMemo(() => {
    const x = paddingLeft + (snrDb / maxSnrGraph) * plotW;
    const y = graphHeight - paddingBottom - (shannonCap / (maxCapGraph || 1)) * plotH;
    return { x, y };
  }, [snrDb, shannonCap, maxCapGraph, plotW, plotH, graphHeight, paddingLeft, paddingBottom]);

  const explanation = (
    <div>
      <p style={{ margin: 0 }}>
        <strong>SHANNON THEOREM VS NYQUIST THEOREM: </strong>
        Nyquist theorem gives the theoretical maximum bit rate for a <em>noiseless channel</em> based on bandwidth and discrete signal levels L:
        <strong> C = 2B log₂(L)</strong>.
        Shannon theorem establishes the absolute theoretical upper bound for a <em>noisy channel</em> regardless of how many signal levels are used:
        <strong> C = B log₂(1 + SNR)</strong>.
      </p>
      <div style={{ marginTop: 'var(--sp-2)' }}>
        For a {formatBps(shannonB).replace('bps', 'Hz')} channel with {snrDb} dB SNR (power ratio ≈ {Math.round(snrLinear)}:1), the maximum possible information transfer rate is <strong>{formatBps(shannonCap)}</strong>.
      </div>
    </div>
  );

  const steps = (
    <div>
      <div><strong>Shannon Capacity Step-by-Step:</strong></div>
      <div>1. Convert SNR from dB to linear power ratio:</div>
      <div>&nbsp;&nbsp;&nbsp;SNR_linear = 10^(SNR_dB / 10) = 10^({snrDb} / 10) = 10^{snrDb / 10} = <strong>{snrLinear.toFixed(2)}</strong></div>
      <div>2. Compute log₂(1 + SNR_linear):</div>
      <div>&nbsp;&nbsp;&nbsp;log₂(1 + {snrLinear.toFixed(2)}) = log₂({(1 + snrLinear).toFixed(2)}) = <strong>{Math.log2(1 + snrLinear).toFixed(3)}</strong></div>
      <div>3. Multiply by channel Bandwidth B = {shannonB} Hz:</div>
      <div>&nbsp;&nbsp;&nbsp;C = {shannonB} × {Math.log2(1 + snrLinear).toFixed(3)} = <strong>{Math.round(shannonCap)} bps ({formatBps(shannonCap)})</strong></div>
      <div style={{ marginTop: 8 }}><strong>Nyquist Rate Step-by-Step:</strong></div>
      <div>&nbsp;&nbsp;&nbsp;C = 2 × {nyquistB} × log₂({levels}) = 2 × {nyquistB} × {Math.log2(levels)} = <strong>{nyquistCap} bps ({formatBps(nyquistCap)})</strong></div>
    </div>
  );

  return (
    <div className={styles.container}>
      <SimControls
        title="Channel Capacity &amp; Theoretical Limits"
        explanation={explanation}
        steps={steps}
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((s) => !s)}
        onReset={handleReset}
      />

      {/* Dual Calculators Grid */}
      <div className={styles.calcGrid}>
        {/* Shannon Card */}
        <div className={styles.calcCard}>
          <div className={styles.calcHeader}>
            <span className={styles.calcTitle}>Shannon Capacity (Noisy Channel)</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-accent-500)' }}>
              C = B log₂(1 + SNR)
            </span>
          </div>

          <div className={styles.resultBox}>
            <div className={styles.resultVal}>{formatBps(shannonCap)}</div>
            <div className={styles.resultLabel}>Maximum Theoretical Bit Rate</div>
          </div>

          <div className={styles.sliderRow}>
            <div className={styles.sliderHeader}>
              <span>Channel Bandwidth (B):</span>
              <span>{formatBps(shannonB).replace('bps', 'Hz')}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="20000"
              step="500"
              value={shannonB}
              onChange={(e) => setShannonB(parseInt(e.target.value, 10))}
              className={styles.sliderInput}
              aria-label="Shannon bandwidth"
            />
          </div>

          <div className={styles.sliderRow}>
            <div className={styles.sliderHeader}>
              <span>Signal-to-Noise Ratio (SNR):</span>
              <span>{snrDb} dB (ratio ≈ {Math.round(snrLinear)}:1)</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={snrDb}
              onChange={(e) => setSnrDb(parseInt(e.target.value, 10))}
              className={styles.sliderInput}
              aria-label="Signal to noise ratio dB"
            />
          </div>
        </div>

        {/* Nyquist Card */}
        <div className={styles.calcCard}>
          <div className={styles.calcHeader}>
            <span className={styles.calcTitle}>Nyquist Bit Rate (Noiseless Channel)</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-unit-2)' }}>
              C = 2B log₂(L)
            </span>
          </div>

          <div className={styles.resultBox}>
            <div className={styles.resultVal} style={{ color: 'var(--color-unit-2)' }}>
              {formatBps(nyquistCap)}
            </div>
            <div className={styles.resultLabel}>Noiseless Maximum Bit Rate</div>
          </div>

          <div className={styles.sliderRow}>
            <div className={styles.sliderHeader}>
              <span>Channel Bandwidth (B):</span>
              <span>{formatBps(nyquistB).replace('bps', 'Hz')}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="20000"
              step="500"
              value={nyquistB}
              onChange={(e) => setNyquistB(parseInt(e.target.value, 10))}
              className={styles.sliderInput}
              aria-label="Nyquist bandwidth"
            />
          </div>

          <div className={styles.sliderRow}>
            <div className={styles.sliderHeader}>
              <span>Discrete Signal Levels (L):</span>
              <span>{levels} levels ({Math.log2(levels)} bits/signal element)</span>
            </div>
            <select
              value={levels}
              onChange={(e) => setLevels(parseInt(e.target.value, 10))}
              style={{ padding: '6px', borderRadius: '4px', background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            >
              <option value="2">2 Levels (1 bit/baud)</option>
              <option value="4">4 Levels (2 bits/baud)</option>
              <option value="8">8 Levels (3 bits/baud)</option>
              <option value="16">16 Levels (4 bits/baud)</option>
              <option value="64">64 Levels (6 bits/baud)</option>
              <option value="256">256 Levels (8 bits/baud)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Graph Section: Shannon Capacity vs SNR */}
      <div className={styles.graphSection}>
        <div className={styles.graphHeader}>
          <span className={styles.graphTitle}>Live Curve: Shannon Capacity vs SNR (for B = {formatBps(shannonB).replace('bps', 'Hz')})</span>
        </div>
        <div style={{ background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', padding: '6px', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Capacity vs SNR curve">
            {/* Axis */}
            <line x1={paddingLeft} y1={graphHeight - paddingBottom} x2={graphWidth - 15} y2={graphHeight - paddingBottom} stroke="var(--color-border-strong)" strokeWidth="1.5" />
            <line x1={paddingLeft} y1="15" x2={paddingLeft} y2={graphHeight - paddingBottom} stroke="var(--color-border-strong)" strokeWidth="1.5" />

            {/* X-axis ticks (dB) */}
            {[0, 15, 30, 45, 60].map((db) => {
              const x = paddingLeft + (db / maxSnrGraph) * plotW;
              return (
                <g key={db}>
                  <line x1={x} y1={graphHeight - paddingBottom} x2={x} y2={graphHeight - paddingBottom + 5} stroke="var(--color-text-tertiary)" />
                  <text x={x} y={graphHeight - paddingBottom + 18} fontSize="10" textAnchor="middle" fill="var(--color-text-tertiary)">
                    {db}dB
                  </text>
                </g>
              );
            })}

            {/* Y-axis label */}
            <text x="10" y="20" fontSize="10" fill="var(--color-text-tertiary)">
              Cap (bps)
            </text>

            {/* Shannon capacity curve */}
            <path d={shannonCurveD} fill="none" stroke="var(--color-accent-500)" strokeWidth="2.5" />

            {/* Current operating point marker */}
            <circle cx={currentPt.x} cy={currentPt.y} r="6" fill="var(--color-unit-3)" stroke="#ffffff" strokeWidth="2" />
            <text x={currentPt.x} y={currentPt.y - 12} fontSize="10" fontWeight="bold" textAnchor="middle" fill="var(--color-text-primary)">
              {formatBps(shannonCap)}
            </text>
          </svg>
        </div>
      </div>

      {/* Media Comparison Table */}
      <div className={styles.mediaTableWrapper}>
        <div style={{ fontWeight: 'bold', fontSize: 'var(--fs-sm)', marginBottom: 'var(--sp-2)' }}>
          Physical Transmission Media Comparison (Guided vs Unguided)
        </div>
        <table className={styles.mediaTable}>
          <thead>
            <tr>
              <th>Medium Type</th>
              <th>Typical Bandwidth</th>
              <th>Attenuation / Losses</th>
              <th>EMI Immunity</th>
              <th>Relative Cost</th>
              <th>Key Textbook Use Case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Twisted Pair (UTP Cat 6)</strong></td>
              <td>Up to 250 MHz (1-10 Gbps)</td>
              <td>High (repeater every ~100m)</td>
              <td>Moderate (twisting cancels crosstalk)</td>
              <td>Lowest</td>
              <td>Office LANs (10Base-T, 100Base-TX)</td>
            </tr>
            <tr>
              <td><strong>Coaxial Cable (RG-58/RG-11)</strong></td>
              <td>Up to 500 MHz</td>
              <td>Moderate (higher than fibre)</td>
              <td>Good (outer braided shield)</td>
              <td>Moderate</td>
              <td>Cable TV, legacy Ethernet (10Base2)</td>
            </tr>
            <tr>
              <td><strong>Optical Fibre (Single Mode)</strong></td>
              <td>Terahertz (&gt; 100 Gbps)</td>
              <td>Extremely Low (0.2 dB/km)</td>
              <td>Immune (photons in dielectric glass)</td>
              <td>High</td>
              <td>Internet Backbones, long-haul undersea</td>
            </tr>
            <tr>
              <td><strong>Terrestrial Microwave</strong></td>
              <td>1 GHz – 300 GHz</td>
              <td>Atmospheric rain fade</td>
              <td>Vulnerable to interference</td>
              <td>Moderate to High</td>
              <td>Line-of-sight towers, cellular backhaul</td>
            </tr>
            <tr>
              <td><strong>Satellite Microwave</strong></td>
              <td>1 GHz – 40 GHz (C, Ku, Ka)</td>
              <td>High distance path loss</td>
              <td>Atmospheric / solar interference</td>
              <td>Very High (orbital launch)</td>
              <td>Global broadcast, transcontinental links</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
