import { useState, useMemo, useCallback } from 'react';
import {
  lineCode,
  type LineCodeScheme,
  type LineCodeResult,
  sanitizeBitString,
} from '../../lib/lineCoding';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './LineCoding.module.css';

const ALL_SCHEMES: { id: LineCodeScheme; name: string }[] = [
  { id: 'NRZ-L', name: 'NRZ-L' },
  { id: 'NRZ-I', name: 'NRZ-I' },
  { id: 'RZ', name: 'RZ' },
  { id: 'Manchester', name: 'Manchester' },
  { id: 'DiffManchester', name: 'Diff Manchester' },
  { id: 'AMI', name: 'AMI' },
  { id: 'MLT-3', name: 'MLT-3' },
];

export function LineCoding() {
  const [bitString, setBitString] = useState<string>('01001110');
  const [selectedSchemes, setSelectedSchemes] = useState<Set<LineCodeScheme>>(
    new Set(['NRZ-L', 'Manchester', 'AMI'])
  );
  const [showSteps, setShowSteps] = useState<boolean>(false);

  const cleanBits = useMemo(() => sanitizeBitString(bitString), [bitString]);

  const toggleScheme = (scheme: LineCodeScheme) => {
    setSelectedSchemes((prev) => {
      const next = new Set(prev);
      if (next.has(scheme)) {
        if (next.size > 1) next.delete(scheme); // keep at least 1
      } else {
        next.add(scheme);
      }
      return next;
    });
  };

  const handleReset = useCallback(() => {
    setBitString('01001110');
    setSelectedSchemes(new Set(['NRZ-L', 'Manchester', 'AMI']));
  }, []);

  // Compute encoding for all selected schemes
  const encodedResults = useMemo<LineCodeResult[]>(() => {
    return Array.from(selectedSchemes).map((scheme) => lineCode(cleanBits, scheme));
  }, [cleanBits, selectedSchemes]);

  // Waveform SVG constants
  const svgWidth = 620;
  const svgHeight = 90;
  const topPad = 15;
  const bottomPad = 25;
  const usableHeight = svgHeight - topPad - bottomPad;
  const zeroY = topPad + usableHeight / 2;
  const highY = topPad;
  const lowY = topPad + usableHeight;

  const bitWidth = cleanBits.length > 0 ? svgWidth / cleanBits.length : svgWidth;

  const explanation = (
    <div>
      <p style={{ margin: 0 }}>
        <strong>LINE CODING COMPARISON: </strong>
        Line coding converts a sequence of binary digits into a digital signal waveform.
        Key criteria include <strong>DC Component</strong> (zero DC avoids baseline wander and permits transformer isolation)
        and <strong>Self-Synchronization</strong> (frequent voltage transitions ensure the receiver clock stays locked).
      </p>
      <div style={{ marginTop: 'var(--sp-2)' }}>
        Comparing <strong>{selectedSchemes.size}</strong> schemes across <strong>{cleanBits.length}</strong> bits:
        Manchester guarantees zero DC and synchronization on every bit, while AMI eliminates DC drift for alternating 1s.
      </div>
    </div>
  );

  const steps = (
    <div>
      <div><strong>Line Coding Principles &amp; Metrics:</strong></div>
      {encodedResults.map((r) => (
        <div key={r.scheme} style={{ margin: '4px 0' }}>
          • <strong>{r.scheme}</strong>: DC Component = {r.dcComponent.toFixed(3)} | Transitions = {r.totalTransitions} | Max No-Transition Streak = {r.maxNoTransitionStreak} bits
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.container}>
      <SimControls
        title="Line Coding &amp; Waveform Analyzer"
        explanation={explanation}
        steps={steps}
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((s) => !s)}
        onReset={handleReset}
      >
        <div className={styles.inputRow} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.inputFieldWrapper}>
            <label htmlFor="bit-input" style={{ fontSize: 'var(--fs-xs)', fontWeight: 'bold' }}>
              Data Bits:
            </label>
            <input
              id="bit-input"
              type="text"
              value={bitString}
              onChange={(e) => setBitString(e.target.value)}
              maxLength={16}
              className={styles.bitInput}
              placeholder="e.g. 01001110"
              aria-label="Binary bit string input"
            />
          </div>

          <div className={styles.presetBtns}>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-tertiary)', alignSelf: 'center' }}>
              Quick Presets:
            </span>
            <button className={styles.presetBtn} onClick={() => setBitString('01001110')}>
              Forouzan Standard (01001110)
            </button>
            <button className={styles.presetBtn} onClick={() => setBitString('10101010')}>
              Alternating (10101010)
            </button>
            <button className={styles.presetBtn} onClick={() => setBitString('00000000')}>
              All Zeros (Sync Test)
            </button>
            <button className={styles.presetBtn} onClick={() => setBitString('11111111')}>
              All Ones (DC Test)
            </button>
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 'bold', marginBottom: 'var(--sp-2)' }}>
            Select Schemes to Stack and Compare:
          </div>
          <div className={styles.schemesSelector}>
            {ALL_SCHEMES.map((s) => {
              const active = selectedSchemes.has(s.id);
              return (
                <button
                  key={s.id}
                  className={`${styles.schemeChip} ${active ? styles.schemeChipActive : ''}`}
                  onClick={() => toggleScheme(s.id)}
                  aria-pressed={active}
                >
                  <span>{active ? '✓' : '+'}</span>
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </SimControls>

      {/* Stacked Waveform Cards */}
      <div className={styles.waveformsStack}>
        {encodedResults.map((result) => {
          // Build SVG path
          let pathD = '';
          const transitions: { x: number; y: number }[] = [];

          result.segments.forEach((seg, i) => {
            const startX = i * bitWidth;
            const midX = startX + bitWidth / 2;
            const endX = (i + 1) * bitWidth;

            const y1 = seg.firstHalfLevel === 1 ? highY : seg.firstHalfLevel === -1 ? lowY : zeroY;
            const y2 = seg.secondHalfLevel === 1 ? highY : seg.secondHalfLevel === -1 ? lowY : zeroY;

            if (i === 0) {
              pathD += `M ${startX} ${y1}`;
            } else {
              // Connect from previous level
              const prevSeg = result.segments[i - 1];
              const prevY =
                prevSeg?.secondHalfLevel === 1
                  ? highY
                  : prevSeg?.secondHalfLevel === -1
                  ? lowY
                  : zeroY;
              if (prevY !== y1) {
                pathD += ` L ${startX} ${y1}`;
                transitions.push({ x: startX, y: (prevY + y1) / 2 });
              }
            }

            pathD += ` L ${midX} ${y1}`;

            if (y1 !== y2) {
              pathD += ` L ${midX} ${y2}`;
              transitions.push({ x: midX, y: (y1 + y2) / 2 });
            }

            pathD += ` L ${endX} ${y2}`;
          });

          const isZeroDc = Math.abs(result.dcComponent) < 0.05;

          return (
            <div key={result.scheme} className={styles.waveformCard}>
              <div className={styles.waveformHeader}>
                <span className={styles.schemeTitle}>{result.scheme}</span>
                <div className={styles.badgeGroup}>
                  <span className={`${styles.badge} ${isZeroDc ? styles.goodBadge : styles.warnBadge}`}>
                    DC: {result.dcComponent.toFixed(2)} {isZeroDc ? '(Zero DC)' : ''}
                  </span>
                  <span className={styles.badge}>
                    Transitions: {result.totalTransitions}
                  </span>
                </div>
              </div>

              {/* Waveform Canvas */}
              <div style={{ background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', padding: '4px', overflowX: 'auto' }}>
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  role="img"
                  aria-label={`${result.scheme} waveform for bits ${cleanBits}`}
                >
                  {/* Grid lines and Bit Values */}
                  {cleanBits.split('').map((bit, idx) => {
                    const x = idx * bitWidth;
                    return (
                      <g key={idx}>
                        {/* Vertical bit boundary */}
                        <line
                          x1={x}
                          y1="0"
                          x2={x}
                          y2={svgHeight - 15}
                          stroke="var(--color-border)"
                          strokeDasharray="2 3"
                        />
                        {/* Mid-bit clock line */}
                        <line
                          x1={x + bitWidth / 2}
                          y1="0"
                          x2={x + bitWidth / 2}
                          y2={svgHeight - 15}
                          stroke="var(--color-border)"
                          strokeDasharray="1 4"
                          opacity="0.4"
                        />
                        {/* Bit label */}
                        <text
                          x={x + bitWidth / 2}
                          y={svgHeight - 4}
                          textAnchor="middle"
                          fontSize="11"
                          fontFamily="var(--font-mono)"
                          fontWeight="bold"
                          fill="var(--color-text-secondary)"
                        >
                          {bit}
                        </text>
                      </g>
                    );
                  })}
                  {/* End boundary */}
                  <line
                    x1={svgWidth}
                    y1="0"
                    x2={svgWidth}
                    y2={svgHeight - 15}
                    stroke="var(--color-border)"
                  />

                  {/* 0V Reference Line */}
                  <line
                    x1="0"
                    y1={zeroY}
                    x2={svgWidth}
                    y2={zeroY}
                    stroke="var(--color-border-strong)"
                    strokeWidth="1"
                    opacity="0.6"
                  />

                  {/* Waveform Signal */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="var(--color-accent-500)"
                    strokeWidth="2.5"
                    strokeLinejoin="miter"
                  />

                  {/* Transition highlight dots */}
                  {transitions.map((t, idx) => (
                    <circle
                      key={idx}
                      cx={t.x}
                      cy={t.y}
                      r="3.5"
                      fill="var(--color-unit-2)"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  ))}
                </svg>
              </div>

              {/* Explanatory Notes */}
              <div className={styles.notesRow}>
                <div><strong>DC Component:</strong> {result.dcNote}</div>
                <div><strong>Synchronization:</strong> {result.syncNote}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
