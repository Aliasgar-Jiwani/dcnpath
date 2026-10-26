import { useState, useMemo, useCallback } from 'react';
import { calculateFdm, simulateSyncTdm, simulateStatTdm } from '../../lib/multiplexing';
import type { TdmSource } from '../../lib/multiplexing';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './Multiplexing.module.css';

type MuxMode = 'fdm' | 'sync-tdm' | 'stat-tdm';

const SOURCE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

function makeTdmSources(count: number, activeFlags: boolean[]): TdmSource[] {
  const letters = 'ABCDEFGH';
  return Array.from({ length: count }, (_, i) => ({
    id: `src-${i}`,
    label: `S${i + 1}`,
    dataBuffer: [letters[i % 8]!, letters[(i + 3) % 8]!, letters[(i + 5) % 8]!, letters[(i + 1) % 8]!],
    active: activeFlags[i] ?? true,
  }));
}

export function MultiplexingSim() {
  const [mode, setMode] = useState<MuxMode>('fdm');

  // FDM controls
  const [fdmChannels, setFdmChannels] = useState(4);
  const [fdmBw, setFdmBw] = useState(4); // kHz
  const [fdmGuard, setFdmGuard] = useState(1); // kHz

  // TDM controls
  const [tdmSources, setTdmSources] = useState(4);
  const [activeFlags, setActiveFlags] = useState<boolean[]>([true, true, false, true]);

  const handleReset = useCallback(() => {
    setFdmChannels(4);
    setFdmBw(4);
    setFdmGuard(1);
    setTdmSources(4);
    setActiveFlags([true, true, false, true]);
  }, []);

  // FDM result
  const fdmResult = useMemo(
    () => calculateFdm(fdmChannels, fdmBw, fdmGuard),
    [fdmChannels, fdmBw, fdmGuard]
  );

  // TDM sources
  const sources = useMemo(
    () => makeTdmSources(tdmSources, activeFlags),
    [tdmSources, activeFlags]
  );
  const syncResult = useMemo(() => simulateSyncTdm(sources, 4), [sources]);
  const statResult = useMemo(() => simulateStatTdm(sources, Math.max(2, tdmSources - 1), 4), [sources, tdmSources]);

  const toggleActive = (idx: number) => {
    setActiveFlags((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const explanation = (
    <div>
      {mode === 'fdm' && (
        <p style={{ margin: 0 }}>
          <strong>Frequency-Division Multiplexing (FDM):</strong> Each source is assigned a non-overlapping frequency band
          separated by guard bands. Total bandwidth = {fdmResult.totalBandwidth} kHz.
          Efficiency = {fdmResult.efficiency}% (useful bandwidth / total bandwidth).
        </p>
      )}
      {mode === 'sync-tdm' && (
        <p style={{ margin: 0 }}>
          <strong>Synchronous TDM:</strong> Each source gets a fixed slot in every frame, even when idle.
          Efficiency = {syncResult.overallEfficiency}% ({syncResult.usedSlots} used / {syncResult.totalSlots} total slots).
          {syncResult.wastedSlots > 0 && ` ${syncResult.wastedSlots} slots are wasted because those sources have no data.`}
        </p>
      )}
      {mode === 'stat-tdm' && (
        <p style={{ margin: 0 }}>
          <strong>Statistical TDM:</strong> Slots are allocated dynamically to active sources only.
          Efficiency = {statResult.overallEfficiency}%.
          {statResult.queuedRemaining > 0 && ` ${statResult.queuedRemaining} items remain queued.`}
        </p>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <SimControls
        title="Multiplexing Simulator"
        explanation={explanation}
        onReset={handleReset}
      />

      {/* Mode selector */}
      <div className={styles.modeBtns}>
        {([['fdm', 'FDM'], ['sync-tdm', 'Sync TDM'], ['stat-tdm', 'Stat TDM']] as const).map(([m, label]) => (
          <button
            key={m}
            className={`${styles.modeBtn} ${mode === m ? styles.modeBtnActive : ''}`}
            onClick={() => setMode(m as MuxMode)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── FDM ── */}
      {mode === 'fdm' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Frequency Spectrum</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-unit-3)' }}>
              B = {fdmResult.totalBandwidth} kHz | η = {fdmResult.efficiency}%
            </span>
          </div>

          {/* Spectrum bar */}
          <div className={styles.spectrumBar}>
            {fdmResult.channels.map((ch, i) => {
              const left = ((ch.centerFreq - ch.bandwidth / 2) / fdmResult.totalBandwidth) * 100;
              const width = (ch.bandwidth / fdmResult.totalBandwidth) * 100;
              return (
                <div
                  key={ch.id}
                  className={styles.channelBlock}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    background: SOURCE_COLORS[i % SOURCE_COLORS.length],
                  }}
                >
                  {ch.name}
                </div>
              );
            })}
          </div>

          {/* Sliders */}
          <div className={styles.sliderRow}>
            <div className={styles.sliderHeader}>
              <span>Channels:</span><span>{fdmChannels}</span>
            </div>
            <input type="range" min="2" max="8" value={fdmChannels}
              onChange={(e) => setFdmChannels(parseInt(e.target.value, 10))}
              className={styles.sliderInput} aria-label="FDM channels" />
          </div>
          <div className={styles.sliderRow}>
            <div className={styles.sliderHeader}>
              <span>Channel Bandwidth:</span><span>{fdmBw} kHz</span>
            </div>
            <input type="range" min="1" max="20" value={fdmBw}
              onChange={(e) => setFdmBw(parseInt(e.target.value, 10))}
              className={styles.sliderInput} aria-label="Channel bandwidth" />
          </div>
          <div className={styles.sliderRow}>
            <div className={styles.sliderHeader}>
              <span>Guard Band:</span><span>{fdmGuard} kHz</span>
            </div>
            <input type="range" min="0" max="5" value={fdmGuard}
              onChange={(e) => setFdmGuard(parseInt(e.target.value, 10))}
              className={styles.sliderInput} aria-label="Guard band" />
          </div>
        </div>
      )}

      {/* ── Sync TDM ── */}
      {mode === 'sync-tdm' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Synchronous TDM Frames</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-unit-3)' }}>
              η = {syncResult.overallEfficiency}% | Wasted: {syncResult.wastedSlots}
            </span>
          </div>

          {/* Source active toggles */}
          <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-2)' }}>
            {sources.map((src, i) => (
              <button
                key={src.id}
                onClick={() => toggleActive(i)}
                style={{
                  padding: '4px 10px', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${SOURCE_COLORS[i % SOURCE_COLORS.length]}`,
                  background: activeFlags[i] ? SOURCE_COLORS[i % SOURCE_COLORS.length] : 'transparent',
                  color: activeFlags[i] ? '#fff' : 'var(--color-text-secondary)',
                  fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-bold)', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {src.label} {activeFlags[i] ? '●' : '○'}
              </button>
            ))}
          </div>

          {/* Frames */}
          {syncResult.frames.map((frame) => (
            <div key={frame.frameIndex} className={styles.frameRow}>
              <span className={styles.frameLabel}>F{frame.frameIndex}</span>
              <div className={styles.framingBit}>{frame.framingBit}</div>
              {frame.slots.map((slot, si) => (
                <div
                  key={si}
                  className={`${styles.slot} ${slot.data ? styles.slotFilled : styles.slotEmpty}`}
                  style={slot.data ? { background: SOURCE_COLORS[si % SOURCE_COLORS.length] } : undefined}
                >
                  {slot.data ?? '—'}
                </div>
              ))}
            </div>
          ))}

          {/* Sources slider */}
          <div className={styles.sliderRow}>
            <div className={styles.sliderHeader}>
              <span>Sources:</span><span>{tdmSources}</span>
            </div>
            <input type="range" min="2" max="6" value={tdmSources}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                setTdmSources(n);
                setActiveFlags((prev) => {
                  const next = Array(n).fill(true);
                  prev.forEach((v, i) => { if (i < n) next[i] = v; });
                  return next;
                });
              }}
              className={styles.sliderInput} aria-label="TDM sources" />
          </div>
        </div>
      )}

      {/* ── Statistical TDM ── */}
      {mode === 'stat-tdm' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Statistical TDM Frames</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-unit-3)' }}>
              η = {statResult.overallEfficiency}%
            </span>
          </div>

          {/* Source active toggles */}
          <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-2)' }}>
            {sources.map((src, i) => (
              <button
                key={src.id}
                onClick={() => toggleActive(i)}
                style={{
                  padding: '4px 10px', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${SOURCE_COLORS[i % SOURCE_COLORS.length]}`,
                  background: activeFlags[i] ? SOURCE_COLORS[i % SOURCE_COLORS.length] : 'transparent',
                  color: activeFlags[i] ? '#fff' : 'var(--color-text-secondary)',
                  fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-bold)', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {src.label} {activeFlags[i] ? '●' : '○'}
              </button>
            ))}
          </div>

          {/* Frames */}
          {statResult.frames.map((frame) => (
            <div key={frame.frameIndex} className={styles.frameRow}>
              <span className={styles.frameLabel}>F{frame.frameIndex}</span>
              {frame.slots.length === 0 ? (
                <div className={`${styles.slot} ${styles.slotEmpty}`} style={{ flex: 3 }}>Empty frame</div>
              ) : (
                frame.slots.map((slot, si) => {
                  const srcIdx = sources.findIndex((s) => s.id === slot.sourceId);
                  return (
                    <div
                      key={si}
                      className={`${styles.slot} ${styles.slotFilled}`}
                      style={{ background: SOURCE_COLORS[srcIdx >= 0 ? srcIdx % SOURCE_COLORS.length : 0] }}
                    >
                      <span style={{ fontSize: 8, opacity: 0.7 }}>[{slot.sourceAddress}]</span>&nbsp;{slot.data}
                    </div>
                  );
                })
              )}
            </div>
          ))}

          <div className={styles.sliderRow}>
            <div className={styles.sliderHeader}>
              <span>Sources:</span><span>{tdmSources}</span>
            </div>
            <input type="range" min="2" max="6" value={tdmSources}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                setTdmSources(n);
                setActiveFlags((prev) => {
                  const next = Array(n).fill(true);
                  prev.forEach((v, i) => { if (i < n) next[i] = v; });
                  return next;
                });
              }}
              className={styles.sliderInput} aria-label="TDM sources" />
          </div>
        </div>
      )}
    </div>
  );
}
