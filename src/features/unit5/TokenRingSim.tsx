import { useState, useMemo, useCallback, useEffect } from 'react';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './TokenRingSim.module.css';

type NetworkStandard = 'ieee-802.5' | 'fddi-dual-ring';

interface Station {
  id: number;
  name: string;
  angleDeg: number;
  hasData: boolean;
  priority: number;
}

export function TokenRingSim() {
  const [standard, setStandard] = useState<NetworkStandard>('ieee-802.5');
  const [senderStation, setSenderStation] = useState<number>(1);
  const [receiverStation, setReceiverStation] = useState<number>(3);
  const [isCableBroken, setIsCableBroken] = useState<boolean>(false);
  const [showSteps, setShowSteps] = useState<boolean>(false);

  // Ring animation state
  const [tokenPosition, setTokenPosition] = useState<number>(1); // 1..5
  const [isFrameBusy, setIsFrameBusy] = useState<boolean>(false);
  const [frameStatusBits, setFrameStatusBits] = useState<{ a: number; c: number }>({ a: 0, c: 0 });
  const [isAutoCirculating, setIsAutoCirculating] = useState<boolean>(false);

  // Statistics
  const [tokensPassed, setTokensPassed] = useState<number>(0);
  const [framesDelivered, setFramesDelivered] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  const stations: Station[] = useMemo(
    () => [
      { id: 1, name: 'Station 1', angleDeg: 270, hasData: false, priority: 0 },
      { id: 2, name: 'Station 2', angleDeg: 342, hasData: false, priority: 0 },
      { id: 3, name: 'Station 3', angleDeg: 54, hasData: false, priority: 0 },
      { id: 4, name: 'Station 4', angleDeg: 126, hasData: false, priority: 0 },
      { id: 5, name: 'Station 5', angleDeg: 198, hasData: false, priority: 0 },
    ],
    []
  );

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString().slice(3, 8);
    setLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 20)]);
  }, []);

  const handleReset = useCallback(() => {
    setTokenPosition(1);
    setIsFrameBusy(false);
    setFrameStatusBits({ a: 0, c: 0 });
    setIsAutoCirculating(false);
    setIsCableBroken(false);
    setTokensPassed(0);
    setFramesDelivered(0);
    setLogs([]);
  }, []);

  // Step the token forward by 1 station clockwise
  const stepToken = useCallback(() => {
    setTokensPassed((t) => t + 1);
    const nextPos = tokenPosition === 5 ? 1 : tokenPosition + 1;
    setTokenPosition(nextPos);

    if (!isFrameBusy) {
      // Free token arriving at nextPos
      if (nextPos === senderStation) {
        // Sender captures free token!
        setIsFrameBusy(true);
        setFrameStatusBits({ a: 0, c: 0 });
        addLog(
          `Station ${senderStation} captures Free Token → Sets T=1 (Busy) → Transmits frame to Station ${receiverStation}`
        );
      } else {
        addLog(`Free Token passed to Station ${nextPos}`);
      }
    } else {
      // Busy frame traveling
      if (nextPos === receiverStation) {
        // Destination station copies frame and sets A and C bits!
        setFrameStatusBits({ a: 1, c: 1 });
        addLog(
          `Station ${receiverStation} recognized address → Copied payload → Set Address Recognized (A=1) & Frame Copied (C=1)`
        );
      } else if (nextPos === senderStation) {
        // Frame returned to sender!
        setIsFrameBusy(false);
        setFramesDelivered((d) => d + 1);
        addLog(
          `Frame returned to Source (Station ${senderStation}) with A=${frameStatusBits.a}, C=${frameStatusBits.c} → Frame stripped → Fresh Free Token released!`
        );
      } else {
        addLog(`Station ${nextPos} examined frame (Not Destination) → Repeated downstream`);
      }
    }
  }, [
    tokenPosition,
    isFrameBusy,
    senderStation,
    receiverStation,
    frameStatusBits,
    addLog,
  ]);

  // Auto circulation timer
  useEffect(() => {
    if (!isAutoCirculating) return;
    const timer = setInterval(() => {
      stepToken();
    }, 1000);
    return () => clearInterval(timer);
  }, [isAutoCirculating, stepToken]);

  // Calculate coordinates on the ring circle
  const centerX = 200;
  const centerY = 160;
  const radius = 100;

  const getStationCoords = (angleDeg: number, r: number = radius) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: centerX + r * Math.cos(rad),
      y: centerY + r * Math.sin(rad),
    };
  };

  const activeTokenCoords = useMemo(() => {
    const st = stations.find((s) => s.id === tokenPosition);
    return st ? getStationCoords(st.angleDeg) : { x: centerX, y: centerY };
  }, [stations, tokenPosition]);

  return (
    <div className={styles.container}>
      <SimControls
        title="Token Ring & FDDI Dual-Ring Simulator"
        explanation={
          <div>
            <strong>
              {standard === 'ieee-802.5'
                ? 'IEEE 802.5 Token Ring Protocol'
                : 'FDDI Dual Counter-Rotating Ring (100 Mbps)'}
            </strong>
            <p style={{ marginTop: 'var(--sp-1)', marginBottom: 0 }}>
              {standard === 'ieee-802.5'
                ? 'A small 3-byte Token circulates around the ring. Only the station holding the token can transmit. The destination copies the frame and sets A/C status bits; the sender strips its frame and generates a new token.'
                : 'FDDI uses two optical counter-rotating rings (Primary & Secondary). If a cable break occurs, adjacent stations perform "Ring Wrapping", splicing the primary into the secondary to form one self-healing operational loop.'}
            </p>
          </div>
        }
        steps={
          <div>
            <h4>Token Ring Frame &amp; Access Steps</h4>
            <ul>
              <li>
                <strong>Free Token:</strong> 3 bytes — Starting Delimiter (SD), Access Control (AC with Token bit $T=0$), Ending Delimiter (ED).
              </li>
              <li>
                <strong>Frame Capture:</strong> Sender seizes token, changes $T=0$ to $T=1$ (Busy), appends Header, Payload, FCS, and Frame Status (FS).
              </li>
              <li>
                <strong>Destination Copy:</strong> Destination reads frame, copies data into its receive buffer, and asserts $A=1$ (Address Recognized) and $C=1$ (Frame Copied).
              </li>
              <li>
                <strong>Frame Stripping:</strong> Sender absorbs the circulating frame and regenerates a Free Token for the next station.
              </li>
            </ul>
          </div>
        }
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((v) => !v)}
        onReset={handleReset}
      >
        <div className={styles.controlGrid}>
          {/* Architecture / Standard */}
          <div className={`${styles.controlItem} ${styles.controlItemWide}`}>
            <span className={styles.label}>Network Standard</span>
            <div className={styles.segmentedControl}>
              <button
                className={`${styles.segmentBtn} ${standard === 'ieee-802.5' ? styles.segmentActive : ''}`}
                onClick={() => setStandard('ieee-802.5')}
              >
                IEEE 802.5 Ring
              </button>
              <button
                className={`${styles.segmentBtn} ${standard === 'fddi-dual-ring' ? styles.segmentActive : ''}`}
                onClick={() => setStandard('fddi-dual-ring')}
              >
                FDDI Dual Ring
              </button>
            </div>
          </div>

          {/* Sender Station */}
          <div className={styles.controlItem}>
            <span className={styles.label}>Source (Sender) Station</span>
            <div className={styles.segmentedControl}>
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  className={`${styles.segmentBtn} ${senderStation === num ? styles.segmentActive : ''}`}
                  onClick={() => setSenderStation(num)}
                  disabled={receiverStation === num}
                >
                  S{num}
                </button>
              ))}
            </div>
          </div>

          {/* Receiver Station */}
          <div className={styles.controlItem}>
            <span className={styles.label}>Destination Station</span>
            <div className={styles.segmentedControl}>
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  className={`${styles.segmentBtn} ${receiverStation === num ? styles.segmentActive : ''}`}
                  onClick={() => setReceiverStation(num)}
                  disabled={senderStation === num}
                >
                  S{num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SimControls>

      {/* ─── Circular Ring Visualization ─── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>
            {standard === 'ieee-802.5'
              ? 'Token Ring Topology (Deterministic Access)'
              : 'FDDI Counter-Rotating Optical Dual Ring'}
          </span>
          <span className={styles.badge}>
            Current Token Holder: Station {tokenPosition}
          </span>
        </div>

        <div className={styles.ringCanvasWrapper}>
          <svg className={styles.svgCanvas} viewBox="0 0 400 320">
            {/* Primary Ring */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke={isCableBroken ? '#ef4444' : '#3b82f6'}
              strokeWidth={3}
              strokeDasharray={isCableBroken ? '6 4' : 'none'}
            />

            {/* Secondary Ring (FDDI mode) */}
            {standard === 'fddi-dual-ring' && (
              <circle
                cx={centerX}
                cy={centerY}
                r={radius - 22}
                fill="none"
                stroke={isCableBroken ? '#10b981' : '#6b7280'}
                strokeWidth={2}
                strokeDasharray="4 3"
              />
            )}

            {/* Cable Break indicator between Station 2 and 3 if active */}
            {isCableBroken && (
              <g>
                <text x={centerX + 85} y={centerY - 25} fill="#ef4444" fontSize="16" fontWeight="bold">
                  ⚡ BREAK
                </text>
                <path
                  d={`M ${centerX + 80} ${centerY - 45} L ${centerX + 65} ${centerY - 20}`}
                  stroke="#ef4444"
                  strokeWidth="3"
                />
              </g>
            )}

            {/* 5 Stations */}
            {stations.map((st) => {
              const coords = getStationCoords(st.angleDeg);
              const isSender = st.id === senderStation;
              const isReceiver = st.id === receiverStation;
              const hasTokenNow = st.id === tokenPosition;

              return (
                <g key={st.id} className={styles.stationNode}>
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={20}
                    fill={
                      isSender
                        ? 'rgba(59, 130, 246, 0.3)'
                        : isReceiver
                        ? 'rgba(16, 185, 129, 0.3)'
                        : '#1f2937'
                    }
                    stroke={
                      isSender
                        ? '#3b82f6'
                        : isReceiver
                        ? '#10b981'
                        : hasTokenNow
                        ? '#f59e0b'
                        : '#4b5563'
                    }
                    strokeWidth={hasTokenNow ? 3 : 2}
                  />
                  <text
                    x={coords.x}
                    y={coords.y + 4}
                    fill="#fff"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    S{st.id}
                  </text>

                  {/* Badges for Sender / Receiver */}
                  {isSender && (
                    <text
                      x={coords.x}
                      y={coords.y - 25}
                      fill="#60a5fa"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      SENDER (Tx)
                    </text>
                  )}
                  {isReceiver && (
                    <text
                      x={coords.x}
                      y={coords.y - 25}
                      fill="#34d399"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      RECEIVER (Rx)
                    </text>
                  )}
                </g>
              );
            })}

            {/* Token / Frame Marker */}
            <g
              className={styles.tokenMarker}
              transform={`translate(${activeTokenCoords.x}, ${activeTokenCoords.y})`}
            >
              <circle
                r={10}
                fill={isFrameBusy ? '#ef4444' : '#f59e0b'}
                stroke="#fff"
                strokeWidth={2}
              />
              <text
                y={3}
                fill="#fff"
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
              >
                {isFrameBusy ? 'F' : 'T'}
              </text>
            </g>
          </svg>
        </div>

        {/* ─── Frame Details Panel ─── */}
        <div className={styles.statusPanel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <strong>Frame State:</strong>{' '}
              {isFrameBusy ? (
                <span style={{ color: '#f87171' }}>BUSY DATA FRAME (T=1, SA: S{senderStation} → DA: S{receiverStation})</span>
              ) : (
                <span style={{ color: '#fbbf24' }}>FREE TOKEN (T=0, SD | AC | ED)</span>
              )}
            </span>
            <span>
              Frame Status Bits: <strong>A = {frameStatusBits.a}</strong> (Address Recognized),{' '}
              <strong>C = {frameStatusBits.c}</strong> (Frame Copied)
            </span>
          </div>
        </div>

        {/* ─── Control Actions ─── */}
        <div className={styles.actionRow}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={stepToken}
          >
            Advance Token 1 Hop (Station {tokenPosition} → {tokenPosition === 5 ? 1 : tokenPosition + 1})
          </button>

          <button
            className={styles.btn}
            onClick={() => setIsAutoCirculating(!isAutoCirculating)}
          >
            {isAutoCirculating ? '⏸ Pause Ring Circulation' : '▶ Continuous Circulation'}
          </button>

          {standard === 'fddi-dual-ring' && (
            <button
              className={`${styles.btn} ${styles.btnWarning}`}
              onClick={() => {
                setIsCableBroken(!isCableBroken);
                addLog(
                  !isCableBroken
                    ? '⚠️ Cable break simulated between S2 and S3! Stations perform Ring Wrapping to restore connectivity.'
                    : '✔ Optical cable repaired. Normal dual counter-rotating operation restored.'
                );
              }}
            >
              {isCableBroken ? 'Repair Optical Fiber' : 'Simulate Cable Cut (Ring Wrap)'}
            </button>
          )}
        </div>

        {/* ─── Performance Statistics ─── */}
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Token Hops</span>
            <span className={styles.statValue}>{tokensPassed}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Frames Delivered</span>
            <span className={styles.statValue} style={{ color: '#10b981' }}>
              {framesDelivered}
            </span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Data Rate</span>
            <span className={styles.statValue}>
              {standard === 'ieee-802.5' ? '16 Mbps' : '100 Mbps'}
            </span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Access Fairness</span>
            <span className={styles.statValue} style={{ color: 'var(--color-accent-400)' }}>
              Deterministic
            </span>
          </div>
        </div>

        {/* ─── Event Log ─── */}
        <div className={styles.logBox}>
          {logs.length === 0 ? (
            <span style={{ color: 'var(--color-text-tertiary)' }}>
              Click &ldquo;Advance Token 1 Hop&rdquo; or &ldquo;Continuous Circulation&rdquo; to observe token capture and frame delivery.
            </span>
          ) : (
            logs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </div>
    </div>
  );
}
