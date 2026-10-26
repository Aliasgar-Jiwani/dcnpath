import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './ArqSim.module.css';

type ArqMode = 'stop-wait' | 'go-back-n' | 'selective-repeat';

interface FrameState {
  id: number;
  status: 'ready' | 'in-flight' | 'acked' | 'lost' | 'corrupt';
  attempts: number;
}

interface TimelineEvent {
  id: string;
  type: 'data' | 'ack' | 'nak' | 'timeout' | 'lost-data' | 'lost-ack';
  frameNum: number;
  message: string;
  time: string;
}

export function ArqSim() {
  const [protocol, setProtocol] = useState<ArqMode>('go-back-n');
  const [windowSize, setWindowSize] = useState<number>(4);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [errorMode, setErrorMode] = useState<'none' | 'drop-frame' | 'drop-ack'>('none');
  const [showSteps, setShowSteps] = useState<boolean>(false);

  // Sender state
  const [frames, setFrames] = useState<FrameState[]>(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      status: 'ready',
      attempts: 0,
    }))
  );
  const [sendBase, setSendBase] = useState<number>(0);
  const [nextSeqNum, setNextSeqNum] = useState<number>(0);

  // Receiver state
  const [expectedSeq, setExpectedSeq] = useState<number>(0);
  const [receiverBuffer, setReceiverBuffer] = useState<number[]>([]);

  // Timeline / stats
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [totalSent, setTotalSent] = useState<number>(0);
  const [retransmissions, setRetransmissions] = useState<number>(0);
  const [successfulAcks, setSuccessfulAcks] = useState<number>(0);

  // Timer ref
  const timerRef = useRef<number | null>(null);

  // Adjust window constraints based on protocol
  useEffect(() => {
    if (protocol === 'stop-wait') {
      setWindowSize(1);
    } else if (protocol === 'go-back-n') {
      setWindowSize((w) => Math.min(Math.max(w, 2), 7)); // 2^3 - 1 = 7
    } else {
      setWindowSize((w) => Math.min(Math.max(w, 2), 4)); // 2^(3-1) = 4
    }
  }, [protocol]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setFrames(
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        status: 'ready',
        attempts: 0,
      }))
    );
    setSendBase(0);
    setNextSeqNum(0);
    setExpectedSeq(0);
    setReceiverBuffer([]);
    setEvents([]);
    setTotalSent(0);
    setRetransmissions(0);
    setSuccessfulAcks(0);
    setErrorMode('none');
  }, []);

  // Transmit the next frame in the window
  const transmitNext = useCallback(() => {
    const curW = protocol === 'stop-wait' ? 1 : windowSize;
    if (nextSeqNum < sendBase + curW && nextSeqNum < frames.length) {
      const fNum = nextSeqNum;
      const isDrop = errorMode === 'drop-frame';
      const isDropAck = errorMode === 'drop-ack';
      setErrorMode('none'); // consume injected error

      setTotalSent((s) => s + 1);
      setFrames((prev) =>
        prev.map((f) =>
          f.id === fNum
            ? {
                ...f,
                status: isDrop ? 'lost' : 'in-flight',
                attempts: f.attempts + 1,
              }
            : f
        )
      );

      setEvents((ev) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          type: isDrop ? 'lost-data' : 'data',
          frameNum: fNum,
          message: isDrop
            ? `Frame ${fNum} transmitted → LOST IN TRANSIT (Channel Noise)`
            : `Frame ${fNum} transmitted to Receiver`,
          time: new Date().toLocaleTimeString().slice(3, 8),
        },
        ...ev.slice(0, 20),
      ]);

      setNextSeqNum((n) => n + 1);

      // Simulate receiver processing after delay
      if (!isDrop) {
        setTimeout(() => {
          if (isDropAck) {
            setEvents((ev) => [
              {
                id: `${Date.now()}-${Math.random()}`,
                type: 'lost-ack',
                frameNum: fNum,
                message: `ACK ${fNum} sent by Receiver → LOST IN RETURN`,
                time: new Date().toLocaleTimeString().slice(3, 8),
              },
              ...ev.slice(0, 20),
            ]);
            return;
          }

          // Normal ACK processing
          if (protocol === 'stop-wait') {
            setSuccessfulAcks((a) => a + 1);
            setFrames((prev) =>
              prev.map((f) => (f.id === fNum ? { ...f, status: 'acked' } : f))
            );
            setSendBase((b) => b + 1);
            setExpectedSeq((e) => e + 1);
            setEvents((ev) => [
              {
                id: `${Date.now()}-${Math.random()}`,
                type: 'ack',
                frameNum: fNum,
                message: `Receiver verified Frame ${fNum} → ACK ${fNum + 1} received`,
                time: new Date().toLocaleTimeString().slice(3, 8),
              },
              ...ev.slice(0, 20),
            ]);
          } else if (protocol === 'go-back-n') {
            setExpectedSeq((prevExp) => {
              if (fNum === prevExp) {
                // In-order frame!
                const newExp = prevExp + 1;
                setSuccessfulAcks((a) => a + 1);
                setFrames((prev) =>
                  prev.map((f) => (f.id === fNum ? { ...f, status: 'acked' } : f))
                );
                setSendBase(newExp);
                setEvents((ev) => [
                  {
                    id: `${Date.now()}-${Math.random()}`,
                    type: 'ack',
                    frameNum: fNum,
                    message: `In-order Frame ${fNum} accepted → Cumulative ACK ${newExp}`,
                    time: new Date().toLocaleTimeString().slice(3, 8),
                  },
                  ...ev.slice(0, 20),
                ]);
                return newExp;
              } else {
                // Out of order: discard in GBN!
                setEvents((ev) => [
                  {
                    id: `${Date.now()}-${Math.random()}`,
                    type: 'nak',
                    frameNum: fNum,
                    message: `Frame ${fNum} out of order (expected ${prevExp}) → DISCARDED, resending ACK ${prevExp}`,
                    time: new Date().toLocaleTimeString().slice(3, 8),
                  },
                  ...ev.slice(0, 20),
                ]);
                return prevExp;
              }
            });
          } else {
            // Selective Repeat: buffer out of order frames
            setSuccessfulAcks((a) => a + 1);
            setFrames((prev) =>
              prev.map((f) => (f.id === fNum ? { ...f, status: 'acked' } : f))
            );
            setReceiverBuffer((rb) => [...rb, fNum]);
            setEvents((ev) => [
              {
                id: `${Date.now()}-${Math.random()}`,
                type: 'ack',
                frameNum: fNum,
                message: `Receiver accepted Frame ${fNum} → Selective ACK ${fNum}`,
                time: new Date().toLocaleTimeString().slice(3, 8),
              },
              ...ev.slice(0, 20),
            ]);

            // Slide send base if consecutive
            setSendBase((curBase) => {
              if (fNum === curBase) {
                return curBase + 1;
              }
              return curBase;
            });
          }
        }, 350);
      }
    }
  }, [
    protocol,
    windowSize,
    nextSeqNum,
    sendBase,
    frames.length,
    errorMode,
  ]);

  // Handle Timeout / Retransmission
  const handleTimeout = useCallback(() => {
    if (sendBase >= nextSeqNum) return; // Nothing in flight

    setRetransmissions((r) => r + 1);

    if (protocol === 'stop-wait' || protocol === 'go-back-n') {
      // Go back to sendBase and resend all unacked
      const unackedCount = nextSeqNum - sendBase;
      setEvents((ev) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          type: 'timeout',
          frameNum: sendBase,
          message: `TIMEOUT! Timer expired for Frame ${sendBase}. Going back N frames (${unackedCount} frames retransmitted)`,
          time: new Date().toLocaleTimeString().slice(3, 8),
        },
        ...ev.slice(0, 20),
      ]);

      // Reset nextSeqNum to sendBase
      setNextSeqNum(sendBase);
      setFrames((prev) =>
        prev.map((f) =>
          f.id >= sendBase && f.id < nextSeqNum
            ? { ...f, status: 'ready' }
            : f
        )
      );
    } else {
      // Selective Repeat: only retransmit the lowest unacked frame
      setEvents((ev) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          type: 'timeout',
          frameNum: sendBase,
          message: `TIMEOUT! Timer expired for Frame ${sendBase}. Retransmitting ONLY Frame ${sendBase}`,
          time: new Date().toLocaleTimeString().slice(3, 8),
        },
        ...ev.slice(0, 20),
      ]);

      setFrames((prev) =>
        prev.map((f) =>
          f.id === sendBase ? { ...f, status: 'ready' } : f
        )
      );
      setNextSeqNum(sendBase);
    }
  }, [protocol, sendBase, nextSeqNum]);

  // Auto-play loop
  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = window.setInterval(() => {
      const curW = protocol === 'stop-wait' ? 1 : windowSize;
      if (nextSeqNum < sendBase + curW && nextSeqNum < frames.length) {
        transmitNext();
      } else if (sendBase < nextSeqNum) {
        // Can simulate timeout if stuck
        handleTimeout();
      } else {
        setIsPlaying(false);
      }
    }, 1200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, nextSeqNum, sendBase, windowSize, protocol, frames.length, transmitNext, handleTimeout]);

  // Analytical efficiency calculation
  const aParam = 2.0; // typical t_prop / t_trans
  const efficiencyPct = useMemo(() => {
    if (totalSent === 0) return 0;
    return Math.round((successfulAcks / totalSent) * 100);
  }, [successfulAcks, totalSent]);

  const theoreticalUtilization = useMemo(() => {
    if (protocol === 'stop-wait') {
      return Math.round((1 / (1 + 2 * aParam)) * 100);
    } else if (protocol === 'go-back-n') {
      return Math.min(100, Math.round((windowSize / (1 + 2 * aParam)) * 100));
    } else {
      return Math.min(100, Math.round((windowSize / (1 + 2 * aParam)) * 100));
    }
  }, [protocol, windowSize]);

  return (
    <div className={styles.container}>
      <SimControls
        title="ARQ Error & Flow Control Simulator"
        explanation={
          <div>
            <strong>Protocol: {protocol.toUpperCase()}</strong> —{' '}
            {protocol === 'stop-wait' &&
              'Stop-and-Wait sends 1 frame at a time and halts until an acknowledgment arrives. High reliability but low efficiency when propagation delay is high.'}
            {protocol === 'go-back-n' &&
              `Go-Back-N slides a window of ${windowSize} frames. If an error occurs in frame k, receiver discards all following frames, and sender goes back and retransmits all frames from k onward.`}
            {protocol === 'selective-repeat' &&
              `Selective Repeat slides sender and receiver windows of size ${windowSize}. Out-of-order frames are buffered at receiver, and only the damaged frame is retransmitted.`}
          </div>
        }
        steps={
          <div>
            <h4>ARQ Operational Comparison</h4>
            <ul>
              <li>
                <strong>Stop-and-Wait:</strong> Window size = 1, Sequence numbers: 0 and 1. Utilisation U = 1 / (1 + 2a).
              </li>
              <li>
                <strong>Go-Back-N:</strong> Window size W &le; 2^m &minus; 1. Receiver window = 1. Cumulative ACKs. Wastes bandwidth upon lost frames.
              </li>
              <li>
                <strong>Selective Repeat:</strong> Window size W &le; 2^(m&minus;1). Receiver window = W. Individual ACKs/NAKs. Buffers out-of-order packets.
              </li>
            </ul>
          </div>
        }
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((v) => !v)}
        onReset={handleReset}
      >
        <div className={styles.controlGrid}>
          {/* Protocol Selector */}
          <div className={`${styles.controlItem} ${styles.controlItemWide}`}>
            <span className={styles.label}>ARQ Protocol</span>
            <div className={styles.segmentedControl}>
              <button
                className={`${styles.segmentBtn} ${protocol === 'stop-wait' ? styles.segmentActive : ''}`}
                onClick={() => setProtocol('stop-wait')}
              >
                Stop-and-Wait
              </button>
              <button
                className={`${styles.segmentBtn} ${protocol === 'go-back-n' ? styles.segmentActive : ''}`}
                onClick={() => setProtocol('go-back-n')}
              >
                Go-Back-N
              </button>
              <button
                className={`${styles.segmentBtn} ${protocol === 'selective-repeat' ? styles.segmentActive : ''}`}
                onClick={() => setProtocol('selective-repeat')}
              >
                Selective Repeat
              </button>
            </div>
          </div>

          {/* Window Size Slider (GBN & SR) */}
          {protocol !== 'stop-wait' && (
            <div className={styles.controlItem}>
              <div className={styles.label}>
                <span>Send Window Size (W)</span>
                <span className={styles.valueBadge}>{windowSize} frames</span>
              </div>
              <div className={styles.sliderContainer}>
                <input
                  type="range"
                  min={2}
                  max={protocol === 'go-back-n' ? 7 : 4}
                  value={windowSize}
                  onChange={(e) => setWindowSize(Number(e.target.value))}
                  className={styles.sliderInput}
                  aria-label="Send Window Size"
                />
              </div>
            </div>
          )}

          {/* Error Injection */}
          <div className={styles.controlItem}>
            <span className={styles.label}>Inject Channel Impairment</span>
            <div className={styles.segmentedControl}>
              <button
                className={`${styles.segmentBtn} ${errorMode === 'none' ? styles.segmentActive : ''}`}
                onClick={() => setErrorMode('none')}
              >
                Clean
              </button>
              <button
                className={`${styles.segmentBtn} ${errorMode === 'drop-frame' ? styles.segmentActive : ''}`}
                onClick={() => setErrorMode('drop-frame')}
                title="Drop next transmitted frame"
              >
                Drop Frame
              </button>
              <button
                className={`${styles.segmentBtn} ${errorMode === 'drop-ack' ? styles.segmentActive : ''}`}
                onClick={() => setErrorMode('drop-ack')}
                title="Drop next receiver acknowledgment"
              >
                Drop ACK
              </button>
            </div>
          </div>
        </div>
      </SimControls>

      {/* ─── Actions Toolbar ─── */}
      <div className={styles.card}>
        <div className={styles.actionRow}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={transmitNext}
            disabled={nextSeqNum >= sendBase + (protocol === 'stop-wait' ? 1 : windowSize)}
          >
            Transmit Next Frame (Seq #{nextSeqNum})
          </button>

          <button
            className={styles.btn}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? '⏸ Pause Auto-Run' : '▶ Auto-Play Simulation'}
          </button>

          <button
            className={`${styles.btn} ${styles.btnWarning}`}
            onClick={handleTimeout}
            disabled={sendBase >= nextSeqNum}
          >
            Trigger Timeout (Retransmit)
          </button>

          <button
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={() => setErrorMode('drop-frame')}
          >
            Simulate Noise (Drop Next)
          </button>
        </div>

        {/* ─── Window Track Visualizer ─── */}
        <div className={styles.windowVisualizer}>
          <div className={styles.windowRow}>
            <div className={styles.windowHeader}>
              <span>
                Sender Window: [{sendBase} … {sendBase + (protocol === 'stop-wait' ? 1 : windowSize) - 1}] | Next To Send: #{nextSeqNum}
              </span>
              <span>Capacity: {windowSize} frames</span>
            </div>
            <div className={styles.framesTrack}>
              {frames.map((f) => {
                const curW = protocol === 'stop-wait' ? 1 : windowSize;
                const inWindow = f.id >= sendBase && f.id < sendBase + curW;
                return (
                  <div
                    key={f.id}
                    className={`${styles.frameBox} ${
                      f.status === 'acked'
                        ? styles.frameAcked
                        : f.status === 'in-flight'
                        ? styles.frameInFlight
                        : f.status === 'lost'
                        ? styles.frameLost
                        : styles.frameReady
                    } ${inWindow ? styles.inWindowMarker : ''}`}
                  >
                    <span className={styles.frameNumber}>{f.id}</span>
                    <span className={styles.frameStateText}>
                      {f.status === 'acked'
                        ? 'ACK'
                        : f.status === 'in-flight'
                        ? 'FLY'
                        : f.status === 'lost'
                        ? 'LOST'
                        : inWindow
                        ? 'WIN'
                        : 'WAIT'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.windowRow}>
            <div className={styles.windowHeader}>
              <span>
                Receiver State: Expected Seq #{expectedSeq}
                {protocol === 'selective-repeat' &&
                  ` | Buffered: [${receiverBuffer.join(', ')}]`}
              </span>
              <span>Accepting: {protocol === 'go-back-n' ? 'In-Order Only' : 'Windowed'}</span>
            </div>
          </div>
        </div>

        {/* ─── Space-Time Ladder Diagram ─── */}
        <div className={styles.ladderContainer}>
          <div className={styles.ladderHeader}>
            <span>SENDER (Tx)</span>
            <span>SPACE-TIME PROPAGATION TIMELINE</span>
            <span>RECEIVER (Rx)</span>
          </div>

          <div className={styles.ladderTimeline}>
            {events.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: 'var(--sp-6)' }}>
                Click &ldquo;Transmit Next Frame&rdquo; or &ldquo;Auto-Play&rdquo; to begin packet exchanges.
              </div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className={styles.ladderRow}>
                  <div className={styles.stationLineLeft} />
                  <div className={styles.stationLineRight} />
                  <div
                    className={`${styles.packetArrow} ${
                      ev.type === 'data' || ev.type === 'lost-data'
                        ? styles.packetToReceiver
                        : styles.packetToSender
                    } ${
                      ev.type === 'lost-data' || ev.type === 'lost-ack'
                        ? styles.packetLostArrow
                        : ''
                    }`}
                  >
                    <span>
                      [{ev.time}] {ev.message}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ─── Performance Statistics ─── */}
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Frames Transmitted</span>
            <span className={styles.statValue}>{totalSent}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Retransmissions</span>
            <span className={styles.statValue} style={{ color: retransmissions > 0 ? '#f59e0b' : 'inherit' }}>
              {retransmissions}
            </span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>ACKs Received</span>
            <span className={styles.statValue} style={{ color: '#10b981' }}>
              {successfulAcks}
            </span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Observed Efficiency</span>
            <span className={styles.statValue}>{efficiencyPct}%</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Theoretical Utilisation (U)</span>
            <span className={styles.statValue} style={{ color: 'var(--color-accent-400)' }}>
              {theoreticalUtilization}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
