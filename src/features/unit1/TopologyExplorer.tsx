import React, { useState, useMemo, useCallback } from 'react';
import {
  generateTopology,
  analyzeTopology,
  type TopologyType,
  type TopologyNode,
  type TopologyLink,
} from '../../lib/topology';
import { SimControls } from '../../components/SimControls/SimControls';
import { SvgCanvas } from '../../components/SvgCanvas/SvgCanvas';
import styles from './TopologyExplorer.module.css';

const TOPOLOGIES: { id: TopologyType; label: string }[] = [
  { id: 'mesh', label: 'Mesh' },
  { id: 'star', label: 'Star' },
  { id: 'ring', label: 'Ring' },
  { id: 'bus', label: 'Bus' },
  { id: 'tree', label: 'Tree' },
];

export function TopologyExplorer() {
  const [type, setType] = useState<TopologyType>('mesh');
  const [deviceCount, setDeviceCount] = useState<number>(5);
  const [showSteps, setShowSteps] = useState<boolean>(false);

  // Initial network model
  const initial = useMemo(
    () => generateTopology(type, deviceCount, 640, 360),
    [type, deviceCount]
  );

  // Failure tracking
  const [failedNodes, setFailedNodes] = useState<Set<string>>(new Set());
  const [failedLinks, setFailedLinks] = useState<Set<string>>(new Set());

  // Reset failures when topology or count changes
  const handleTypeChange = (newType: TopologyType) => {
    setType(newType);
    setFailedNodes(new Set());
    setFailedLinks(new Set());
  };

  const handleCountChange = (count: number) => {
    setDeviceCount(count);
    setFailedNodes(new Set());
    setFailedLinks(new Set());
  };

  const handleReset = useCallback(() => {
    setFailedNodes(new Set());
    setFailedLinks(new Set());
  }, []);

  const toggleNodeFail = (nodeId: string) => {
    setFailedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const toggleLinkFail = (linkId: string) => {
    setFailedLinks((prev) => {
      const next = new Set(prev);
      if (next.has(linkId)) next.delete(linkId);
      else next.add(linkId);
      return next;
    });
  };

  // Synchronized graph state
  const nodes: TopologyNode[] = useMemo(
    () =>
      initial.nodes.map((n) => ({
        ...n,
        failed: failedNodes.has(n.id),
      })),
    [initial.nodes, failedNodes]
  );

  const links: TopologyLink[] = useMemo(
    () =>
      initial.links.map((l) => ({
        ...l,
        failed:
          failedLinks.has(l.id) ||
          failedNodes.has(l.source) ||
          failedNodes.has(l.target),
      })),
    [initial.links, failedLinks, failedNodes]
  );

  const analysis = useMemo(
    () => analyzeTopology(type, nodes, links),
    [type, nodes, links]
  );

  const explanation = (
    <div>
      <p style={{ margin: 0 }}>
        <strong>{type.toUpperCase()} TOPOLOGY: </strong>
        {type === 'mesh' &&
          'Every node has a dedicated point-to-point link to every other node. If one link fails, all other devices continue communicating via alternate paths.'}
        {type === 'star' &&
          'Each device connects to a central controller (Hub/Switch). If one cable fails, only that device is isolated. If the central hub fails, the entire network collapses.'}
        {type === 'ring' &&
          'Each device has a dedicated point-to-point connection with only the two devices on either side of it. A break in a unidirectional ring disables the entire loop.'}
        {type === 'bus' &&
          'One long backbone cable links all devices using drop lines and taps. A break in the main trunk splits the bus into two disconnected segments and causes signal reflections.'}
        {type === 'tree' &&
          'A variation of star where nodes are attached to secondary hubs that connect to the root switch. Failure of a secondary hub only isolates its own branch.'}
      </p>
      <div style={{ marginTop: 'var(--sp-2)', fontWeight: 'var(--fw-semibold)' }}>
        Status: {analysis.faultToleranceNote}
      </div>
    </div>
  );

  const steps = (
    <div>
      <div><strong>Connectivity Analysis &amp; Math:</strong></div>
      <div>• Formula for Links: {type === 'mesh' ? `n(n - 1) / 2 = ${deviceCount} × ${deviceCount - 1} / 2 = ${analysis.theoreticalLinks}` : `n = ${analysis.theoreticalLinks}`}</div>
      <div>• Total Physical Links: {analysis.totalLinks} (Active: {analysis.activeLinks})</div>
      <div>• I/O Ports Needed: {analysis.portsPerDevice}</div>
      <div>• Graph Connected Components: {analysis.connectedComponents.length}</div>
      <div>• Isolated End Devices: {analysis.isolatedNodes.length > 0 ? analysis.isolatedNodes.join(', ') : 'None'}</div>
      <div>• Single Point of Failure: {analysis.singlePointsOfFailure.join(', ') || 'None (fully redundant)'}</div>
    </div>
  );

  // Lookup node coordinate map for links
  const nodeMap = useMemo(() => {
    const map = new Map<string, TopologyNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  return (
    <div className={styles.container}>
      <SimControls
        title="Network Topology &amp; Fault Explorer"
        explanation={explanation}
        steps={steps}
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((s) => !s)}
        onReset={handleReset}
      >
        <div className={styles.controlGroup}>
          <span className={styles.label}>Topology Type</span>
          <div className={styles.btnGroup}>
            {TOPOLOGIES.map((t) => (
              <button
                key={t.id}
                className={`${styles.typeBtn} ${type === t.id ? styles.activeTypeBtn : ''}`}
                onClick={() => handleTypeChange(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlGroup}>
          <span className={styles.label}>Number of Devices: {deviceCount}</span>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min="3"
              max="12"
              value={deviceCount}
              onChange={(e) => handleCountChange(parseInt(e.target.value, 10))}
              className={styles.slider}
              aria-label="Number of devices"
            />
          </div>
        </div>
      </SimControls>

      {/* Metrics Bar */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricVal}>{analysis.activeLinks} / {analysis.totalLinks}</div>
          <div className={styles.metricLabel}>Active Links</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricVal}>{analysis.activeNodes} / {analysis.totalNodes}</div>
          <div className={styles.metricLabel}>Online Nodes</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricVal}>{analysis.connectedComponents.length}</div>
          <div className={styles.metricLabel}>Partitions</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricVal} style={{ color: analysis.isolatedNodes.length > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
            {analysis.isolatedNodes.length}
          </div>
          <div className={styles.metricLabel}>Isolated Devices</div>
        </div>
      </div>

      {/* Interactive SVG Canvas Card */}
      <div className={styles.canvasCard}>
        <div className={styles.canvasHint}>
          👆 <em>Click any device or cable link below to simulate a hardware fault and observe network partition</em>
        </div>

        <SvgCanvas
          width={640}
          height={360}
          ariaLabel={`${type} topology interactive diagram with ${deviceCount} devices`}
        >
          {/* Links */}
          <g className="links-layer">
            {links.map((link) => {
              const s = nodeMap.get(link.source);
              const t = nodeMap.get(link.target);
              if (!s || !t) return null;
              return (
                <line
                  key={link.id}
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  className={`${styles.linkLine} ${link.failed ? styles.failedLink : ''}`}
                  stroke={link.failed ? 'var(--color-error)' : 'var(--color-accent-400)'}
                  onClick={() => toggleLinkFail(link.id)}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g className="nodes-layer">
            {nodes.map((node) => {
              if (node.id.startsWith('tap-')) return null; // invisible bus taps
              const isIsolated = analysis.isolatedNodes.includes(node.label);
              let fillColor = 'var(--color-accent-500)';
              if (node.isHub) fillColor = 'var(--color-unit-2)';
              if (node.failed) fillColor = 'var(--color-error)';
              else if (isIsolated) fillColor = 'var(--color-warning)';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => toggleNodeFail(node.id)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  aria-label={`Device ${node.label}, status ${node.failed ? 'failed' : isIsolated ? 'isolated' : 'online'}`}
                >
                  <circle
                    r={node.isHub ? 22 : 18}
                    fill={fillColor}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className={styles.nodeCircle}
                  />
                  <text className={styles.nodeText} fill="#ffffff">
                    {node.failed ? '✕' : node.isHub ? 'HUB' : node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </SvgCanvas>
      </div>

      {/* Comparison Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.compTable}>
          <thead>
            <tr>
              <th>Topology</th>
              <th>Cabling Cost</th>
              <th>Links for n Devices</th>
              <th>I/O Ports / Device</th>
              <th>Fault Isolation</th>
              <th>SPOF Vulnerability</th>
            </tr>
          </thead>
          <tbody>
            <tr className={type === 'mesh' ? styles.activeRow : ''}>
              <td><strong>Mesh</strong></td>
              <td>Very High (n(n-1)/2 cables)</td>
              <td>n(n - 1) / 2</td>
              <td>n - 1</td>
              <td>Robust (redundant paths)</td>
              <td>None</td>
            </tr>
            <tr className={type === 'star' ? styles.activeRow : ''}>
              <td><strong>Star</strong></td>
              <td>Moderate (n dedicated drops)</td>
              <td>n</td>
              <td>1 (Central Hub: n)</td>
              <td>Easy (unplugs bad node)</td>
              <td>Central Hub</td>
            </tr>
            <tr className={type === 'ring' ? styles.activeRow : ''}>
              <td><strong>Ring</strong></td>
              <td>Low (point-to-point ring)</td>
              <td>n</td>
              <td>2 (In / Out)</td>
              <td>Difficult (breaks ring)</td>
              <td>Any node or link</td>
            </tr>
            <tr className={type === 'bus' ? styles.activeRow : ''}>
              <td><strong>Bus</strong></td>
              <td>Lowest (shared backbone)</td>
              <td>n drops + 1 backbone</td>
              <td>1</td>
              <td>Difficult (signal reflection)</td>
              <td>Backbone trunk cable</td>
            </tr>
            <tr className={type === 'tree' ? styles.activeRow : ''}>
              <td><strong>Tree</strong></td>
              <td>Moderate to High (hierarchical)</td>
              <td>n - 1</td>
              <td>1 (Hubs: multi-port)</td>
              <td>Good (isolates subtree)</td>
              <td>Root / Tier-1 Switches</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
