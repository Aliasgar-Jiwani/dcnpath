import { useState, useMemo, useCallback } from 'react';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './IsdnSim.module.css';

type IsdnType = 'bri' | 'pri-na' | 'pri-eu';
type ChannelUsage = 'idle' | 'voice' | 'data' | 'video';
type ReferencePoint = 'R' | 'S' | 'T' | 'U';

export function IsdnSim() {
  const [isdnType, setIsdnType] = useState<IsdnType>('bri');
  const [selectedRefPoint, setSelectedRefPoint] = useState<ReferencePoint>('U');
  const [showSteps, setShowSteps] = useState<boolean>(false);

  // Channel allocations for BRI
  const [b1Usage, setB1Usage] = useState<ChannelUsage>('voice');
  const [b2Usage, setB2Usage] = useState<ChannelUsage>('data');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString().slice(3, 8);
    setLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 20)]);
  }, []);

  const handleReset = useCallback(() => {
    setIsdnType('bri');
    setB1Usage('voice');
    setB2Usage('data');
    setSelectedRefPoint('U');
    setLogs([]);
  }, []);

  // Simulate Q.931 Call Setup flow on D Channel
  const simulateCallSetup = useCallback(() => {
    setB1Usage('voice');
    addLog('📡 Q.931: [D-Channel] TE1 sends SETUP (Bearer capability: 3.1 kHz Audio, 64 kbps)');
    setTimeout(() => {
      addLog('📡 Q.931: [D-Channel] LE responds with CALL PROCEEDING (Allocating B1 channel)');
    }, 400);
    setTimeout(() => {
      addLog('📡 Q.931: [D-Channel] Remote station rings: ALERTING');
    }, 800);
    setTimeout(() => {
      addLog('📡 Q.931: [D-Channel] Remote answers: CONNECT → Local sends CONNECT ACK');
      addLog('✔ B1 Channel active: 64 kbps PCM bidirectional voice stream online!');
    }, 1200);
  }, [addLog]);

  // Calculations
  const rateSummary = useMemo(() => {
    if (isdnType === 'bri') {
      return {
        name: 'Basic Rate Interface (BRI)',
        bChannels: 2,
        bRateKbps: 64,
        dRateKbps: 16,
        userRateKbps: 144, // 2*64 + 16
        lineRateKbps: 192,
        overhead: '48 kbps framing & maintenance',
        targetAudience: 'Small office & residential',
      };
    } else if (isdnType === 'pri-na') {
      return {
        name: 'Primary Rate Interface (PRI) — North America & Japan',
        bChannels: 23,
        bRateKbps: 64,
        dRateKbps: 64,
        userRateKbps: 1536, // 23*64 + 64
        lineRateKbps: 1544, // T-1 rate
        overhead: '8 kbps framing (193 bits / 125 μs)',
        targetAudience: 'Medium/large business PBX connections',
      };
    } else {
      return {
        name: 'Primary Rate Interface (PRI) — Europe (E-1)',
        bChannels: 30,
        bRateKbps: 64,
        dRateKbps: 64,
        userRateKbps: 1984, // 30*64 + 64
        lineRateKbps: 2048, // E-1 rate
        overhead: '64 kbps framing (Time Slot 0)',
        targetAudience: 'European enterprise telecom trunks',
      };
    }
  }, [isdnType]);

  const activeBandwidth = useMemo(() => {
    let bw = 0;
    if (b1Usage !== 'idle') bw += 64;
    if (b2Usage !== 'idle') bw += 64;
    return bw;
  }, [b1Usage, b2Usage]);

  return (
    <div className={styles.container}>
      <SimControls
        title="ISDN Architecture & Channel Visualizer"
        explanation={
          <div>
            <strong>Integrated Services Digital Network (ITU-T I-Series)</strong>
            <p style={{ marginTop: 'var(--sp-1)', marginBottom: 0 }}>
              ISDN integrates voice, data, video, and fax over digital telephone lines using separate Bearer (B) channels for user payload and Delta (D) channels for out-of-band signaling (Q.921 LAPD / Q.931).
            </p>
          </div>
        }
        steps={
          <div>
            <h4>ISDN Channels &amp; Interfaces Summary</h4>
            <ul>
              <li>
                <strong>B Channel (Bearer):</strong> 64 kbps digital channel carrying voice (PCM 8 kHz $\times$ 8 bits) or data.
              </li>
              <li>
                <strong>D Channel (Delta):</strong> 16 kbps (BRI) or 64 kbps (PRI) carrying out-of-band call setup &amp; teardown signaling.
              </li>
              <li>
                <strong>BRI (2B + D):</strong> 2 &times; 64 + 16 = 144 kbps user payload (192 kbps line rate).
              </li>
              <li>
                <strong>PRI (23B + D or 30B + D):</strong> 1.544 Mbps (T-1) in North America, 2.048 Mbps (E-1) in Europe.
              </li>
            </ul>
          </div>
        }
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((v) => !v)}
        onReset={handleReset}
      >
        <div className={styles.controlGrid}>
          {/* ISDN Interface Selector */}
          <div className={`${styles.controlItem} ${styles.controlItemWide}`}>
            <span className={styles.label}>ISDN Interface Standard</span>
            <div className={styles.segmentedControl}>
              <button
                className={`${styles.segmentBtn} ${isdnType === 'bri' ? styles.segmentActive : ''}`}
                onClick={() => setIsdnType('bri')}
              >
                BRI (2B+D)
              </button>
              <button
                className={`${styles.segmentBtn} ${isdnType === 'pri-na' ? styles.segmentActive : ''}`}
                onClick={() => setIsdnType('pri-na')}
              >
                PRI (23B+D, T1)
              </button>
              <button
                className={`${styles.segmentBtn} ${isdnType === 'pri-eu' ? styles.segmentActive : ''}`}
                onClick={() => setIsdnType('pri-eu')}
              >
                PRI (30B+D, E1)
              </button>
            </div>
          </div>
        </div>
      </SimControls>

      {/* ─── ISDN Channel Grid ─── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>{rateSummary.name}</span>
          <span className={styles.badge}>
            Total User Data: {rateSummary.userRateKbps} kbps (Wire: {rateSummary.lineRateKbps} kbps)
          </span>
        </div>

        {isdnType === 'bri' ? (
          <div className={styles.channelsGrid}>
            {/* B1 Channel */}
            <div className={`${styles.channelCard} ${b1Usage !== 'idle' ? styles.channelActive : ''}`}>
              <div className={styles.channelHeader}>
                <span className={styles.channelName}>Bearer Channel B1</span>
                <span className={styles.channelRate}>64 kbps</span>
              </div>
              <span
                className={`${styles.channelStateBadge} ${
                  b1Usage === 'idle'
                    ? styles.stateIdle
                    : b1Usage === 'voice'
                    ? styles.stateVoice
                    : styles.stateData
                }`}
              >
                {b1Usage === 'idle' ? 'IDLE' : b1Usage === 'voice' ? 'PCM Voice (64k)' : 'Data Transfer (64k)'}
              </span>
              <div className={styles.channelActionRow}>
                <button
                  className={styles.btnSmall}
                  onClick={() => setB1Usage('voice')}
                >
                  Voice Call
                </button>
                <button
                  className={styles.btnSmall}
                  onClick={() => setB1Usage('data')}
                >
                  Data File
                </button>
                <button
                  className={styles.btnSmall}
                  onClick={() => setB1Usage('idle')}
                >
                  Hang Up
                </button>
              </div>
            </div>

            {/* B2 Channel */}
            <div className={`${styles.channelCard} ${b2Usage !== 'idle' ? styles.channelActive : ''}`}>
              <div className={styles.channelHeader}>
                <span className={styles.channelName}>Bearer Channel B2</span>
                <span className={styles.channelRate}>64 kbps</span>
              </div>
              <span
                className={`${styles.channelStateBadge} ${
                  b2Usage === 'idle'
                    ? styles.stateIdle
                    : b2Usage === 'voice'
                    ? styles.stateVoice
                    : styles.stateData
                }`}
              >
                {b2Usage === 'idle' ? 'IDLE' : b2Usage === 'voice' ? 'PCM Voice (64k)' : 'Data Transfer (64k)'}
              </span>
              <div className={styles.channelActionRow}>
                <button
                  className={styles.btnSmall}
                  onClick={() => setB2Usage('voice')}
                >
                  Voice Call
                </button>
                <button
                  className={styles.btnSmall}
                  onClick={() => setB2Usage('data')}
                >
                  Data File
                </button>
                <button
                  className={styles.btnSmall}
                  onClick={() => setB2Usage('idle')}
                >
                  Hang Up
                </button>
              </div>
            </div>

            {/* D Channel */}
            <div className={`${styles.channelCard} ${styles.channelActive}`}>
              <div className={styles.channelHeader}>
                <span className={styles.channelName}>Delta Channel (D)</span>
                <span className={styles.channelRate}>16 kbps</span>
              </div>
              <span className={`${styles.channelStateBadge} ${styles.stateSignaling}`}>
                Out-of-Band Signalling (Q.921 LAPD / Q.931)
              </span>
              <div className={styles.channelActionRow}>
                <button
                  className={styles.btnSmall}
                  onClick={simulateCallSetup}
                  style={{ width: '100%' }}
                >
                  Simulate Q.931 Call Setup
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--color-bg-tertiary)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-2)' }}>
              Primary Rate Interface Multiplexing Grid: {rateSummary.bChannels} B Channels (64 kbps each) + 1 D Channel (64 kbps)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))', gap: '4px' }}>
              {Array.from({ length: rateSummary.bChannels }, (_, i) => (
                <div
                  key={i}
                  style={{
                    padding: '6px',
                    borderRadius: 'var(--radius-sm)',
                    background: i < 8 ? 'rgba(59, 130, 246, 0.2)' : 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    textAlign: 'center',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  B{i + 1}
                </div>
              ))}
              <div
                style={{
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(245, 158, 11, 0.25)',
                  border: '1px solid #f59e0b',
                  textAlign: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#fbbf24',
                }}
              >
                D (64k)
              </div>
            </div>
          </div>
        )}

        {/* ─── ISDN Reference Points Architecture Explorer ─── */}
        <div className={styles.architectureContainer}>
          <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-bold)', color: 'var(--color-text-secondary)' }}>
            ISDN Functional Devices &amp; Reference Points Architecture (Click R, S, T, or U)
          </div>

          <div className={styles.devicesTrack}>
            <div className={styles.deviceNode}>
              <span className={styles.deviceType}>TE2</span>
              <span className={styles.deviceDesc}>Non-ISDN Device (e.g. RS-232)</span>
            </div>

            <button
              className={styles.referencePointBtn}
              onClick={() => setSelectedRefPoint('R')}
              title="Click Reference Point R"
            >
              <div className={`${styles.refPointCircle} ${selectedRefPoint === 'R' ? styles.refPointActive : ''}`}>
                R
              </div>
              <div className={styles.refPointLine} />
            </button>

            <div className={styles.deviceNode}>
              <span className={styles.deviceType}>TA</span>
              <span className={styles.deviceDesc}>Terminal Adapter</span>
            </div>

            <button
              className={styles.referencePointBtn}
              onClick={() => setSelectedRefPoint('S')}
              title="Click Reference Point S"
            >
              <div className={`${styles.refPointCircle} ${selectedRefPoint === 'S' ? styles.refPointActive : ''}`}>
                S
              </div>
              <div className={styles.refPointLine} />
            </button>

            <div className={styles.deviceNode}>
              <span className={styles.deviceType}>NT2</span>
              <span className={styles.deviceDesc}>Network Term 2 (PBX)</span>
            </div>

            <button
              className={styles.referencePointBtn}
              onClick={() => setSelectedRefPoint('T')}
              title="Click Reference Point T"
            >
              <div className={`${styles.refPointCircle} ${selectedRefPoint === 'T' ? styles.refPointActive : ''}`}>
                T
              </div>
              <div className={styles.refPointLine} />
            </button>

            <div className={styles.deviceNode}>
              <span className={styles.deviceType}>NT1</span>
              <span className={styles.deviceDesc}>Network Term 1 (Line Interface)</span>
            </div>

            <button
              className={styles.referencePointBtn}
              onClick={() => setSelectedRefPoint('U')}
              title="Click Reference Point U"
            >
              <div className={`${styles.refPointCircle} ${selectedRefPoint === 'U' ? styles.refPointActive : ''}`}>
                U
              </div>
              <div className={styles.refPointLine} />
            </button>

            <div className={styles.deviceNode}>
              <span className={styles.deviceType}>LE</span>
              <span className={styles.deviceDesc}>Local Exchange (Telco CO)</span>
            </div>
          </div>

          {/* Reference point specification details */}
          <div className={styles.refInfoBox}>
            {selectedRefPoint === 'R' && (
              <div>
                <strong>Reference Point R (Rate / Terminal Interface):</strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  The boundary between non-ISDN compatible terminal equipment (TE2, e.g. analog telephone or RS-232 serial terminal) and the Terminal Adapter (TA). Uses standard legacy interfaces like V.24/RS-232, V.35, or X.21.
                </p>
              </div>
            )}
            {selectedRefPoint === 'S' && (
              <div>
                <strong>Reference Point S (Subscriber / System Interface):</strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  The 4-wire interface separating ISDN user terminals (TE1 or TA) from the digital customer switching facility (NT2 PBX). Operates at 192 kbps using pseudo-ternary line code over balanced twisted pair.
                </p>
              </div>
            )}
            {selectedRefPoint === 'T' && (
              <div>
                <strong>Reference Point T (Terminal / Trunk Interface):</strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  The 4-wire interface between customer-premises switching (NT2) and customer line termination (NT1). Electrically and functionally identical to the S reference point (often called S/T interface when NT2 is absent).
                </p>
              </div>
            )}
            {selectedRefPoint === 'U' && (
              <div>
                <strong>Reference Point U (User / Local Loop Interface):</strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  The 2-wire copper subscriber loop interface connecting the customer premises (NT1) to the telephone company central office (Local Exchange). Uses 2B1Q (2 Binary 1 Quaternary) in North America or 4B3T in Europe to transmit 160 kbps full duplex over a single twisted pair!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Performance Statistics ─── */}
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Active Payload Bandwidth</span>
            <span className={styles.statValue} style={{ color: '#10b981' }}>
              {isdnType === 'bri' ? `${activeBandwidth} kbps` : `${rateSummary.userRateKbps} kbps`}
            </span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Signaling Channel (D)</span>
            <span className={styles.statValue} style={{ color: '#f59e0b' }}>
              {rateSummary.dRateKbps} kbps
            </span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Line Transmission Rate</span>
            <span className={styles.statValue}>{rateSummary.lineRateKbps} kbps</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Framing Overhead</span>
            <span className={styles.statValue} style={{ color: 'var(--color-accent-400)' }}>
              {rateSummary.overhead.split(' ')[0]} kbps
            </span>
          </div>
        </div>

        {/* ─── Q.931 Signaling Protocol Exchange Log ─── */}
        <div className={styles.logBox}>
          {logs.length === 0 ? (
            <span style={{ color: 'var(--color-text-tertiary)' }}>
              Click &ldquo;Simulate Q.931 Call Setup&rdquo; or change channels to inspect D-channel signaling traffic.
            </span>
          ) : (
            logs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </div>
    </div>
  );
}
