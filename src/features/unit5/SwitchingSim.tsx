import { useState, useMemo, useCallback } from 'react';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './SwitchingSim.module.css';

export function SwitchingSim() {
  const [messageSizeKb, setMessageSizeKb] = useState<number>(100);
  const [numPackets, setNumPackets] = useState<number>(20);
  const [bandwidthMbps, setBandwidthMbps] = useState<number>(10);
  const [propDelayMs, setPropDelayMs] = useState<number>(10);
  const [setupTimeMs, setSetupTimeMs] = useState<number>(150);
  const [showSteps, setShowSteps] = useState<boolean>(false);

  const numHops = 3; // Source -> Switch 1 -> Switch 2 -> Destination

  // Calculations in milliseconds
  const delays = useMemo(() => {
    const messageBits = messageSizeKb * 1024 * 8;
    const bandwidthBps = bandwidthMbps * 1_000_000;

    // Entire message transmission time (ms)
    const tTransMsg = (messageBits / bandwidthBps) * 1000;

    // Per-packet transmission time (ms)
    const packetBits = messageBits / numPackets;
    const tTransPkt = (packetBits / bandwidthBps) * 1000;

    // Total propagation time across 3 hops (ms)
    const tPropTotal = numHops * propDelayMs;

    // 1. Circuit Switching
    const circuitSetup = setupTimeMs;
    const circuitTrans = tTransMsg;
    const circuitProp = tPropTotal;
    const circuitTeardown = 30; // ms
    const circuitTotal = circuitSetup + circuitTrans + circuitProp + circuitTeardown;

    // 2. Message Switching (Store-and-forward entire message at all 3 hops)
    // Delay = 3 * (tTransMsg + propDelayMs)
    const messageTransTotal = numHops * tTransMsg;
    const messagePropTotal = tPropTotal;
    const messageTotal = messageTransTotal + messagePropTotal;

    // 3. Packet Switching (Datagram - Pipelined)
    // Delay = (numHops + numPackets - 1) * tTransPkt + tPropTotal
    const packetPipelineTrans = (numHops + numPackets - 1) * tTransPkt;
    const packetPropTotal = tPropTotal;
    const packetTotal = packetPipelineTrans + packetPropTotal;

    // 4. Packet Switching (Virtual Circuit)
    const vcSetup = setupTimeMs * 0.5; // lighter VC setup
    const vcTotal = vcSetup + packetTotal;

    const maxDelay = Math.max(circuitTotal, messageTotal, messageTotal, 1);

    return {
      tTransMsg,
      tTransPkt,
      tPropTotal,
      circuit: {
        setup: circuitSetup,
        trans: circuitTrans,
        prop: circuitProp,
        teardown: circuitTeardown,
        total: circuitTotal,
        pct: (circuitTotal / maxDelay) * 100,
      },
      message: {
        trans: messageTransTotal,
        prop: messagePropTotal,
        total: messageTotal,
        pct: (messageTotal / maxDelay) * 100,
      },
      packetDatagram: {
        trans: packetPipelineTrans,
        prop: packetPropTotal,
        total: packetTotal,
        pct: (packetTotal / maxDelay) * 100,
      },
      packetVc: {
        setup: vcSetup,
        trans: packetPipelineTrans,
        prop: packetPropTotal,
        total: vcTotal,
        pct: (vcTotal / maxDelay) * 100,
      },
    };
  }, [messageSizeKb, numPackets, bandwidthMbps, propDelayMs, setupTimeMs]);

  const handleReset = useCallback(() => {
    setMessageSizeKb(100);
    setNumPackets(20);
    setBandwidthMbps(10);
    setPropDelayMs(10);
    setSetupTimeMs(150);
  }, []);

  return (
    <div className={styles.container}>
      <SimControls
        title="Network Switching Techniques Comparison"
        explanation={
          <div>
            <strong>Circuit vs. Message vs. Packet Switching</strong>
            <p style={{ marginTop: 'var(--sp-1)', marginBottom: 0 }}>
              Circuit switching requires a dedicated physical circuit setup prior to transfer. Message switching stores the entire message at each hop before forwarding. Packet switching breaks data into packets that pipeline through the network concurrently, achieving dramatically lower latency and better link utilisation.
            </p>
          </div>
        }
        steps={
          <div>
            <h4>Delay Mathematical Models (3-Hop Network)</h4>
            <ul>
              <li>
                <strong>Circuit Switching:</strong> T_circuit = T_setup + (Message Size / Bandwidth) + 3 &times; t_prop + T_teardown
              </li>
              <li>
                <strong>Message Switching:</strong> T_message = 3 &times; (Message Size / Bandwidth + t_prop)
              </li>
              <li>
                <strong>Packet Switching:</strong> T_packet = (3 + K &minus; 1) &times; (Packet Size / Bandwidth) + 3 &times; t_prop, where K = number of packets.
              </li>
              <li>
                <strong>Pipelining Gain:</strong> Packets travel concurrently over adjacent links, eliminating the store-and-forward idle waiting of whole messages.
              </li>
            </ul>
          </div>
        }
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((v) => !v)}
        onReset={handleReset}
      >
        <div className={styles.controlGrid}>
          {/* Message Size */}
          <div className={styles.controlItem}>
            <div className={styles.label}>
              <span>Message Size</span>
              <span className={styles.valueBadge}>{messageSizeKb} KB ({(messageSizeKb * 8).toLocaleString()} kb)</span>
            </div>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={messageSizeKb}
                onChange={(e) => setMessageSizeKb(Number(e.target.value))}
                className={styles.sliderInput}
                aria-label="Message Size in KB"
              />
            </div>
          </div>

          {/* Number of Packets */}
          <div className={styles.controlItem}>
            <div className={styles.label}>
              <span>Packets (K)</span>
              <span className={styles.valueBadge}>{numPackets} pkts ({(messageSizeKb / numPackets).toFixed(1)} KB/pkt)</span>
            </div>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                min={2}
                max={50}
                step={1}
                value={numPackets}
                onChange={(e) => setNumPackets(Number(e.target.value))}
                className={styles.sliderInput}
                aria-label="Number of Packets"
              />
            </div>
          </div>

          {/* Bandwidth */}
          <div className={styles.controlItem}>
            <div className={styles.label}>
              <span>Link Bandwidth</span>
              <span className={styles.valueBadge}>{bandwidthMbps} Mbps</span>
            </div>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                min={1}
                max={100}
                step={1}
                value={bandwidthMbps}
                onChange={(e) => setBandwidthMbps(Number(e.target.value))}
                className={styles.sliderInput}
                aria-label="Bandwidth in Mbps"
              />
            </div>
          </div>

          {/* Prop Delay */}
          <div className={styles.controlItem}>
            <div className={styles.label}>
              <span>Hop Prop Delay</span>
              <span className={styles.valueBadge}>{propDelayMs} ms ({propDelayMs * 3} ms total)</span>
            </div>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={propDelayMs}
                onChange={(e) => setPropDelayMs(Number(e.target.value))}
                className={styles.sliderInput}
                aria-label="Propagation Delay in ms"
              />
            </div>
          </div>
        </div>
      </SimControls>

      {/* ─── Network Topology Visualizer ─── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>3-Hop Network Transmission Path</span>
          <span className={styles.badge}>
            Trans Time/Pkt: {delays.tTransPkt.toFixed(2)} ms
          </span>
        </div>

        <div className={styles.topologyCard}>
          <div className={styles.nodeBox}>
            <div className={styles.nodeCircle}>Tx</div>
            <span className={styles.nodeLabel}>Source</span>
          </div>

          <div className={styles.linkLine} />

          <div className={styles.nodeBox}>
            <div className={styles.nodeCircle}>SW1</div>
            <span className={styles.nodeLabel}>Switch 1</span>
          </div>

          <div className={styles.linkLine} />

          <div className={styles.nodeBox}>
            <div className={styles.nodeCircle}>SW2</div>
            <span className={styles.nodeLabel}>Switch 2</span>
          </div>

          <div className={styles.linkLine} />

          <div className={styles.nodeBox}>
            <div className={styles.nodeCircle}>Rx</div>
            <span className={styles.nodeLabel}>Destination</span>
          </div>
        </div>

        {/* ─── Stacked Delay Comparison Bars ─── */}
        <div className={styles.comparisonGrid}>
          {/* Circuit Switching */}
          <div className={styles.techRow}>
            <div className={styles.techHeader}>
              <span>Circuit Switching (PSTN)</span>
              <span className={styles.timeBadge}>{delays.circuit.total.toFixed(1)} ms</span>
            </div>
            <div className={styles.timelineBar}>
              <div
                className={`${styles.barSegment} ${styles.segSetup}`}
                style={{ width: `${(delays.circuit.setup / delays.circuit.total) * delays.circuit.pct}%` }}
                title={`Circuit Setup: ${delays.circuit.setup} ms`}
              >
                Setup ({delays.circuit.setup}ms)
              </div>
              <div
                className={`${styles.barSegment} ${styles.segTrans}`}
                style={{ width: `${(delays.circuit.trans / delays.circuit.total) * delays.circuit.pct}%` }}
                title={`Direct Transfer: ${delays.circuit.trans.toFixed(1)} ms`}
              >
                Transfer ({delays.circuit.trans.toFixed(1)}ms)
              </div>
              <div
                className={`${styles.barSegment} ${styles.segProp}`}
                style={{ width: `${(delays.circuit.prop / delays.circuit.total) * delays.circuit.pct}%` }}
                title={`Propagation: ${delays.circuit.prop} ms`}
              >
                Prop
              </div>
            </div>
          </div>

          {/* Message Switching */}
          <div className={styles.techRow}>
            <div className={styles.techHeader}>
              <span>Message Switching (Store &amp; Forward Whole Msg)</span>
              <span className={styles.timeBadge} style={{ color: '#ef4444' }}>
                {delays.message.total.toFixed(1)} ms
              </span>
            </div>
            <div className={styles.timelineBar}>
              <div
                className={`${styles.barSegment} ${styles.segStore}`}
                style={{ width: `${(delays.message.trans / delays.message.total) * delays.message.pct}%` }}
                title={`Store & Forward (3 hops): ${delays.message.trans.toFixed(1)} ms`}
              >
                3 × Whole Msg Store &amp; Forward ({delays.message.trans.toFixed(1)}ms)
              </div>
              <div
                className={`${styles.barSegment} ${styles.segProp}`}
                style={{ width: `${(delays.message.prop / delays.message.total) * delays.message.pct}%` }}
                title={`Propagation: ${delays.message.prop} ms`}
              >
                Prop
              </div>
            </div>
          </div>

          {/* Packet Switching (Datagram) */}
          <div className={styles.techRow}>
            <div className={styles.techHeader}>
              <span>Packet Switching — Datagram (IP)</span>
              <span className={styles.timeBadge} style={{ color: '#10b981' }}>
                {delays.packetDatagram.total.toFixed(1)} ms (Fastest!)
              </span>
            </div>
            <div className={styles.timelineBar}>
              <div
                className={`${styles.barSegment} ${styles.segPipeline}`}
                style={{ width: `${(delays.packetDatagram.trans / delays.packetDatagram.total) * delays.packetDatagram.pct}%` }}
                title={`Pipelined Packet Stream: ${delays.packetDatagram.trans.toFixed(1)} ms`}
              >
                Pipelined Stream ({delays.packetDatagram.trans.toFixed(1)}ms)
              </div>
              <div
                className={`${styles.barSegment} ${styles.segProp}`}
                style={{ width: `${(delays.packetDatagram.prop / delays.packetDatagram.total) * delays.packetDatagram.pct}%` }}
                title={`Propagation: ${delays.packetDatagram.prop} ms`}
              >
                Prop
              </div>
            </div>
          </div>

          {/* Packet Switching (Virtual Circuit) */}
          <div className={styles.techRow}>
            <div className={styles.techHeader}>
              <span>Packet Switching — Virtual Circuit (ATM / Frame Relay)</span>
              <span className={styles.timeBadge}>{delays.packetVc.total.toFixed(1)} ms</span>
            </div>
            <div className={styles.timelineBar}>
              <div
                className={`${styles.barSegment} ${styles.segSetup}`}
                style={{ width: `${(delays.packetVc.setup / delays.packetVc.total) * delays.packetVc.pct}%` }}
                title={`VC Setup: ${delays.packetVc.setup.toFixed(1)} ms`}
              >
                VC Setup ({delays.packetVc.setup.toFixed(1)}ms)
              </div>
              <div
                className={`${styles.barSegment} ${styles.segPipeline}`}
                style={{ width: `${(delays.packetVc.trans / delays.packetVc.total) * delays.packetVc.pct}%` }}
                title={`Pipelined Packets: ${delays.packetVc.trans.toFixed(1)} ms`}
              >
                Pipelined Packets
              </div>
              <div
                className={`${styles.barSegment} ${styles.segProp}`}
                style={{ width: `${(delays.packetVc.prop / delays.packetVc.total) * delays.packetVc.pct}%` }}
              >
                Prop
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className={styles.legendRow}>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: '#f59e0b' }} />
              <span>Call / Path Setup</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: '#3b82f6' }} />
              <span>Direct Link Transmission</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: '#ec4899' }} />
              <span>Message Store-and-Forward</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: '#10b981' }} />
              <span>Pipelined Packet Forwarding</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: '#8b5cf6' }} />
              <span>Propagation Delay</span>
            </div>
          </div>
        </div>

        {/* ─── Comparison Matrix Table ─── */}
        <div className={styles.tableContainer}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Circuit Switching</th>
                <th>Message Switching</th>
                <th>Packet Switching (Datagram)</th>
                <th>Virtual Circuit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Dedicated Path</strong></td>
                <td>Yes (Exclusively reserved)</td>
                <td>No</td>
                <td>No (Dynamic routing)</td>
                <td>Logical VC path</td>
              </tr>
              <tr>
                <td><strong>Store-and-Forward</strong></td>
                <td>No</td>
                <td>Yes (Entire message)</td>
                <td>Yes (Per-packet pipelined)</td>
                <td>Yes (Per-packet pipelined)</td>
              </tr>
              <tr>
                <td><strong>Bandwidth Efficiency</strong></td>
                <td>Low (idle during pauses)</td>
                <td>Moderate</td>
                <td className={styles.winnerCell}>High (Statistical sharing)</td>
                <td>High</td>
              </tr>
              <tr>
                <td><strong>Setup Overhead</strong></td>
                <td>High (Call setup required)</td>
                <td>None</td>
                <td className={styles.winnerCell}>None (Connectionless)</td>
                <td>Moderate (VC setup)</td>
              </tr>
              <tr>
                <td><strong>Intermediate Storage</strong></td>
                <td>Zero buffer needed</td>
                <td>Gigantic buffers required</td>
                <td className={styles.winnerCell}>Small packet buffers</td>
                <td>Small packet buffers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
