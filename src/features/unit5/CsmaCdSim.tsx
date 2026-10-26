import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './CsmaCdSim.module.css';

type PersistenceMode = '1-persistent' | 'non-persistent' | 'p-persistent';

interface NodeState {
  id: string;
  name: string;
  posPct: number; // position on bus: 15%, 38%, 62%, 85%
  status: 'idle' | 'sensing' | 'transmitting' | 'collision' | 'jamming' | 'backoff';
  collisionCount: number;
  backoffSlots: number;
  backoffCountdown: number;
}

interface SignalWave {
  id: string;
  sourceNodeId: string;
  leftPct: number;
  rightPct: number;
  type: 'clean' | 'collision' | 'jam';
}

export function CsmaCdSim() {
  const [persistence, setPersistence] = useState<PersistenceMode>('1-persistent');
  const [cableLengthMeters, setCableLengthMeters] = useState<number>(1000);
  const [pProbability, setPProbability] = useState<number>(0.5);
  const [showSteps, setShowSteps] = useState<boolean>(false);

  // Statistics
  const [successfulTx, setSuccessfulTx] = useState<number>(0);
  const [collisionsCount, setCollisionsCount] = useState<number>(0);
  const [jamSignalsCount, setJamSignalsCount] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Nodes on the bus
  const [nodes, setNodes] = useState<NodeState[]>([
    { id: 'node-a', name: 'Station A', posPct: 15, status: 'idle', collisionCount: 0, backoffSlots: 0, backoffCountdown: 0 },
    { id: 'node-b', name: 'Station B', posPct: 38, status: 'idle', collisionCount: 0, backoffSlots: 0, backoffCountdown: 0 },
    { id: 'node-c', name: 'Station C', posPct: 62, status: 'idle', collisionCount: 0, backoffSlots: 0, backoffCountdown: 0 },
    { id: 'node-d', name: 'Station D', posPct: 85, status: 'idle', collisionCount: 0, backoffSlots: 0, backoffCountdown: 0 },
  ]);

  const [waves, setWaves] = useState<SignalWave[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString().slice(3, 8);
    setLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 20)]);
  }, []);

  const handleReset = useCallback(() => {
    setNodes([
      { id: 'node-a', name: 'Station A', posPct: 15, status: 'idle', collisionCount: 0, backoffSlots: 0, backoffCountdown: 0 },
      { id: 'node-b', name: 'Station B', posPct: 38, status: 'idle', collisionCount: 0, backoffSlots: 0, backoffCountdown: 0 },
      { id: 'node-c', name: 'Station C', posPct: 62, status: 'idle', collisionCount: 0, backoffSlots: 0, backoffCountdown: 0 },
      { id: 'node-d', name: 'Station D', posPct: 85, status: 'idle', collisionCount: 0, backoffSlots: 0, backoffCountdown: 0 },
    ]);
    setWaves([]);
    setSuccessfulTx(0);
    setCollisionsCount(0);
    setJamSignalsCount(0);
    setLogs([]);
  }, []);

  // Initiate transmission from a specific node
  const transmitFromNode = useCallback((nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== nodeId) return n;
        return {
          ...n,
          status: 'transmitting',
        };
      })
    );

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    addLog(`${node.name} senses medium idle and begins frame transmission.`);

    // Add signal wave starting at node's position
    setWaves((w) => [
      ...w,
      {
        id: `wave-${Date.now()}-${nodeId}`,
        sourceNodeId: nodeId,
        leftPct: node.posPct,
        rightPct: node.posPct,
        type: 'clean',
      },
    ]);
  }, [nodes, addLog]);

  // Transmit simultaneously from A and C to trigger a deterministic collision
  const triggerSimultaneousTx = useCallback(() => {
    transmitFromNode('node-a');
    setTimeout(() => {
      transmitFromNode('node-c');
    }, 150);
  }, [transmitFromNode]);

  // Animation and collision physics loop
  useEffect(() => {
    const interval = setInterval(() => {
      setWaves((prevWaves) => {
        if (prevWaves.length === 0) return prevWaves;

        // Expand waves along the bus
        const expanded = prevWaves.map((wave) => ({
          ...wave,
          leftPct: Math.max(0, wave.leftPct - 4),
          rightPct: Math.min(100, wave.rightPct + 4),
        }));

        // Detect collision if two distinct waves overlap and neither has collided yet
        let hasCollision = false;
        if (expanded.length >= 2) {
          for (let i = 0; i < expanded.length; i++) {
            for (let j = i + 1; j < expanded.length; j++) {
              const w1 = expanded[i];
              const w2 = expanded[j];
              if (w1 && w2 && w1.sourceNodeId !== w2.sourceNodeId) {
                // Check geometric overlap
                if (
                  (w1.leftPct <= w2.rightPct && w1.rightPct >= w2.leftPct) ||
                  (w2.leftPct <= w1.rightPct && w2.rightPct >= w1.leftPct)
                ) {
                  hasCollision = true;
                  w1.type = 'collision';
                  w2.type = 'collision';
                }
              }
            }
          }
        }

        if (hasCollision) {
          setCollisionsCount((c) => c + 1);
          setJamSignalsCount((j) => j + 2);
          addLog('💥 COLLISION DETECTED! Voltage threshold exceeded (V > V_thresh).');

          // Transition transmitting nodes to collision then jamming then backoff
          setNodes((prevNodes) =>
            prevNodes.map((node) => {
              if (node.status === 'transmitting') {
                const k = Math.min(node.collisionCount + 1, 10);
                const maxR = Math.pow(2, k) - 1;
                const r = Math.floor(Math.random() * (maxR + 1));
                addLog(
                  `${node.name} sends 48-bit Jam Signal. Collision #${k} → Backoff R=${r} slots (${(r * 51.2).toFixed(1)} μs)`
                );
                return {
                  ...node,
                  status: 'collision',
                  collisionCount: k,
                  backoffSlots: r,
                  backoffCountdown: r,
                };
              }
              return node;
            })
          );

          // After jam duration, transition to backoff countdown
          setTimeout(() => {
            setNodes((prevNodes) =>
              prevNodes.map((node) =>
                node.status === 'collision'
                  ? { ...node, status: 'backoff' }
                  : node
              )
            );
          }, 800);
        }

        // Filter out waves that fully reached both edges and fade them
        const remaining = expanded.filter(
          (w) => !(w.leftPct <= 0 && w.rightPct >= 100)
        );

        if (remaining.length === 0 && prevWaves.length > 0 && !hasCollision) {
          // If a clean wave finished without collision, mark delivery!
          setSuccessfulTx((s) => s + 1);
          addLog('✔ Frame successfully propagated across entire bus without collision!');
          setNodes((prevNodes) =>
            prevNodes.map((n) =>
              n.status === 'transmitting' ? { ...n, status: 'idle', collisionCount: 0 } : n
            )
          );
        }

        return remaining;
      });

      // Decrement backoff countdowns
      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          if (n.status === 'backoff') {
            if (n.backoffCountdown <= 1) {
              addLog(`${n.name} backoff expired → Ready to sense line and retransmit.`);
              return { ...n, status: 'idle', backoffCountdown: 0 };
            }
            return { ...n, backoffCountdown: n.backoffCountdown - 1 };
          }
          return n;
        })
      );
    }, 120);

    return () => clearInterval(interval);
  }, [addLog]);

  // Theoretical calculations
  const propagationDelayUs = useMemo(() => {
    // 5 μs per km of coaxial cable
    return ((cableLengthMeters / 1000) * 5).toFixed(1);
  }, [cableLengthMeters]);

  const slotTimeUs = 51.2; // 10 Mbps standard
  const minFrameBits = 512; // 64 bytes

  return (
    <div className={styles.container}>
      <SimControls
        title="Ethernet CSMA/CD Bus Simulator"
        explanation={
          <div>
            <strong>CSMA/CD (Carrier Sense Multiple Access / Collision Detection)</strong>
            <p style={{ marginTop: 'var(--sp-1)', marginBottom: 0 }}>
              Stations sense carrier on the shared coaxial bus. If idle, they transmit. If a collision is detected during transmission, the sender aborts, transmits a 48-bit <em>Jam Signal</em>, and invokes <em>Binary Exponential Backoff</em>.
            </p>
          </div>
        }
        steps={
          <div>
            <h4>IEEE 802.3 CSMA/CD Operational Rules</h4>
            <ul>
              <li>
                <strong>1. Carrier Sense:</strong> Listen before talking. If idle, transmit based on persistence mode ({persistence}).
              </li>
              <li>
                <strong>2. Collision Detection:</strong> Monitor bus while transmitting. If voltage spike exceeds threshold (V &gt; V_threshold), collision occurred!
              </li>
              <li>
                <strong>3. Jam Signal:</strong> Transmit 48 bits of jam signal to notify all stations.
              </li>
              <li>
                <strong>4. Binary Exponential Backoff:</strong> Wait R &times; slot_time, where R &isin; [0, 2^k &minus; 1] and k = min(attempts, 10). Max 16 attempts.
              </li>
              <li>
                <strong>5. Minimum Frame Size:</strong> Must be &ge; 2 &times; t_prop &times; Bandwidth = 64 bytes (512 bits).
              </li>
            </ul>
          </div>
        }
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((v) => !v)}
        onReset={handleReset}
      >
        <div className={styles.controlGrid}>
          {/* Persistence Strategy */}
          <div className={`${styles.controlItem} ${styles.controlItemWide}`}>
            <span className={styles.label}>Persistence Strategy</span>
            <div className={styles.segmentedControl}>
              <button
                className={`${styles.segmentBtn} ${persistence === '1-persistent' ? styles.segmentActive : ''}`}
                onClick={() => setPersistence('1-persistent')}
              >
                1-Persistent
              </button>
              <button
                className={`${styles.segmentBtn} ${persistence === 'non-persistent' ? styles.segmentActive : ''}`}
                onClick={() => setPersistence('non-persistent')}
              >
                Non-Persistent
              </button>
              <button
                className={`${styles.segmentBtn} ${persistence === 'p-persistent' ? styles.segmentActive : ''}`}
                onClick={() => setPersistence('p-persistent')}
              >
                p-Persistent
              </button>
            </div>
          </div>

          {/* Cable Length Slider */}
          <div className={styles.controlItem}>
            <div className={styles.label}>
              <span>Cable Length</span>
              <span className={styles.valueBadge}>{cableLengthMeters} m ({propagationDelayUs} μs)</span>
            </div>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                min={200}
                max={2500}
                step={100}
                value={cableLengthMeters}
                onChange={(e) => setCableLengthMeters(Number(e.target.value))}
                className={styles.sliderInput}
                aria-label="Cable length in meters"
              />
            </div>
          </div>

          {/* p value if p-persistent */}
          {persistence === 'p-persistent' && (
            <div className={styles.controlItem}>
              <div className={styles.label}>
                <span>Transmit Probability (p)</span>
                <span className={styles.valueBadge}>p = {pProbability}</span>
              </div>
              <div className={styles.sliderContainer}>
                <input
                  type="range"
                  min={0.1}
                  max={0.9}
                  step={0.1}
                  value={pProbability}
                  onChange={(e) => setPProbability(Number(e.target.value))}
                  className={styles.sliderInput}
                  aria-label="Transmit probability"
                />
              </div>
            </div>
          )}
        </div>
      </SimControls>

      {/* ─── Bus Schematic & Stations ─── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>
            Shared Coaxial Bus Topology (10Base5 / 10Base2)
          </span>
          <span className={styles.badge}>
            Slot Time: {slotTimeUs} μs (512 bits)
          </span>
        </div>

        <div className={styles.busContainer}>
          {/* Top row: 4 Stations */}
          <div className={styles.nodesRow}>
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`${styles.nodeCard} ${
                  node.status === 'transmitting'
                    ? styles.nodeCardTx
                    : node.status === 'collision'
                    ? styles.nodeCardCollision
                    : node.status === 'backoff'
                    ? styles.nodeCardBackoff
                    : styles.nodeCardIdle
                }`}
              >
                <div className={styles.dropCable} />
                <span className={styles.nodeName}>{node.name}</span>
                <span
                  className={`${styles.nodeStatus} ${
                    node.status === 'idle'
                      ? styles.statusIdle
                      : node.status === 'transmitting'
                      ? styles.statusTx
                      : node.status === 'collision'
                      ? styles.statusCollision
                      : node.status === 'jamming'
                      ? styles.statusJam
                      : styles.statusBackoff
                  }`}
                >
                  {node.status}
                </span>

                {node.status === 'backoff' ? (
                  <span className={styles.backoffText}>
                    Wait: {node.backoffCountdown} slots
                  </span>
                ) : (
                  <button
                    className={styles.nodeBtn}
                    onClick={() => transmitFromNode(node.id)}
                    disabled={node.status !== 'idle'}
                  >
                    Transmit Frame
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Coaxial Cable Trunk with propagating waveform pulses */}
          <div className={styles.coaxialCable}>
            <div className={`${styles.cableTerminator} ${styles.terminatorLeft}`} title="50Ω Bus Terminator" />
            <div className={`${styles.cableTerminator} ${styles.terminatorRight}`} title="50Ω Bus Terminator" />

            {waves.map((w) => (
              <div
                key={w.id}
                className={`${styles.signalWave} ${
                  w.type === 'clean'
                    ? styles.cleanSignal
                    : w.type === 'collision'
                    ? styles.collisionSignal
                    : styles.jamSignal
                }`}
                style={{
                  left: `${w.leftPct}%`,
                  width: `${Math.max(4, w.rightPct - w.leftPct)}%`,
                }}
              />
            ))}
          </div>
        </div>

        {/* ─── Actions Toolbar ─── */}
        <div className={styles.toolbarRow}>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            onClick={triggerSimultaneousTx}
          >
            Simulate Collision (Station A &amp; C Transmit Simultaneously)
          </button>
        </div>

        {/* ─── Performance Statistics ─── */}
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Successful Transmissions</span>
            <span className={styles.statValue} style={{ color: '#10b981' }}>
              {successfulTx}
            </span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Collisions Detected</span>
            <span className={styles.statValue} style={{ color: '#ef4444' }}>
              {collisionsCount}
            </span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Jam Signals Emitted</span>
            <span className={styles.statValue} style={{ color: '#f59e0b' }}>
              {jamSignalsCount}
            </span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Min Frame Size</span>
            <span className={styles.statValue}>64 Bytes</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Round-Trip Prop (2τ)</span>
            <span className={styles.statValue}>{(Number(propagationDelayUs) * 2).toFixed(1)} μs</span>
          </div>
        </div>

        {/* ─── Terminal Event Log ─── */}
        <div className={styles.logBox}>
          {logs.length === 0 ? (
            <span style={{ color: 'var(--color-text-tertiary)' }}>
              Click any &ldquo;Transmit Frame&rdquo; button or &ldquo;Simulate Collision&rdquo; to begin MAC activity.
            </span>
          ) : (
            logs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </div>
    </div>
  );
}
