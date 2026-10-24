/**
 * Network Topologies: Mesh, Star, Ring, Bus, and Tree
 * Analysis of link counts, ports, reachability, and single point of failure.
 * Forouzan Chapter 1
 */

export type TopologyType = 'mesh' | 'star' | 'ring' | 'bus' | 'tree';

export interface TopologyNode {
  id: string;
  label: string;
  x: number;
  y: number;
  isHub?: boolean;
  failed?: boolean;
}

export interface TopologyLink {
  id: string;
  source: string;
  target: string;
  failed?: boolean;
}

export interface TopologyAnalysis {
  totalNodes: number;
  activeNodes: number;
  totalLinks: number;
  activeLinks: number;
  theoreticalLinks: number;
  portsPerDevice: string;
  connectedComponents: string[][];
  isolatedNodes: string[];
  isFullyConnected: boolean;
  singlePointsOfFailure: string[]; // nodes whose failure splits the active network
  faultToleranceNote: string;
}

/**
 * Generates nodes and links for a given topology layout.
 * @param type Topology type
 * @param count Number of end devices (3 to 12)
 * @param width Canvas width
 * @param height Canvas height
 */
export function generateTopology(
  type: TopologyType,
  count: number,
  width: number = 600,
  height: number = 400
): { nodes: TopologyNode[]; links: TopologyLink[] } {
  const n = Math.max(3, Math.min(12, count));
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.38;

  const nodes: TopologyNode[] = [];
  const links: TopologyLink[] = [];

  switch (type) {
    case 'mesh': {
      // Circle layout with all pairs connected
      for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        nodes.push({
          id: `node-${i}`,
          label: `D${i + 1}`,
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        });
      }
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const nodeI = nodes[i];
          const nodeJ = nodes[j];
          if (nodeI && nodeJ) {
            links.push({
              id: `link-${nodeI.id}-${nodeJ.id}`,
              source: nodeI.id,
              target: nodeJ.id,
            });
          }
        }
      }
      break;
    }

    case 'star': {
      // Central Hub + peripheral devices
      nodes.push({
        id: 'hub',
        label: 'Hub/Switch',
        x: cx,
        y: cy,
        isHub: true,
      });

      for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        const devId = `node-${i}`;
        nodes.push({
          id: devId,
          label: `D${i + 1}`,
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        });
        links.push({
          id: `link-hub-${devId}`,
          source: 'hub',
          target: devId,
        });
      }
      break;
    }

    case 'ring': {
      // Circle layout with adjacent neighbors connected
      for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        nodes.push({
          id: `node-${i}`,
          label: `D${i + 1}`,
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        });
      }
      for (let i = 0; i < n; i++) {
        const next = (i + 1) % n;
        const nodeI = nodes[i];
        const nodeNext = nodes[next];
        if (nodeI && nodeNext) {
          links.push({
            id: `link-${nodeI.id}-${nodeNext.id}`,
            source: nodeI.id,
            target: nodeNext.id,
          });
        }
      }
      break;
    }

    case 'bus': {
      // Linear backbone with drop lines
      const leftX = width * 0.12;
      const rightX = width * 0.88;
      const backboneY = cy;
      const stepX = (rightX - leftX) / (n - 1);

      for (let i = 0; i < n; i++) {
        const x = leftX + i * stepX;
        const isUpper = i % 2 === 0;
        const y = isUpper ? cy - 100 : cy + 100;
        const devId = `node-${i}`;
        nodes.push({
          id: devId,
          label: `D${i + 1}`,
          x,
          y,
        });
        // Drop line from backbone to device
        const tapId = `tap-${i}`;
        nodes.push({
          id: tapId,
          label: '',
          x,
          y: backboneY,
          isHub: true,
        });
        links.push({
          id: `drop-${i}`,
          source: tapId,
          target: devId,
        });
      }

      // Backbone links between taps
      for (let i = 0; i < n - 1; i++) {
        links.push({
          id: `backbone-${i}`,
          source: `tap-${i}`,
          target: `tap-${i + 1}`,
        });
      }
      break;
    }

    case 'tree': {
      // Hierarchical: Root (Level 0) -> 2-3 Intermediate (Level 1) -> Leaves
      const rootId = 'root';
      nodes.push({
        id: rootId,
        label: 'Root Switch',
        x: cx,
        y: height * 0.18,
        isHub: true,
      });

      const branchCount = Math.min(3, Math.ceil(n / 2));
      const branchStep = width / (branchCount + 1);
      const leavesPerBranch = Math.floor(n / branchCount);
      let assignedLeaves = 0;

      for (let b = 0; b < branchCount; b++) {
        const bId = `hub-${b}`;
        const bx = branchStep * (b + 1);
        const by = height * 0.5;
        nodes.push({
          id: bId,
          label: `Switch ${b + 1}`,
          x: bx,
          y: by,
          isHub: true,
        });
        links.push({
          id: `link-root-${bId}`,
          source: rootId,
          target: bId,
        });

        const thisBranchLeaves =
          b === branchCount - 1 ? n - assignedLeaves : leavesPerBranch;
        const leafStep = branchStep / (thisBranchLeaves + 1);

        for (let l = 0; l < thisBranchLeaves; l++) {
          const devId = `node-${assignedLeaves}`;
          const lx = bx - branchStep / 2 + (l + 1) * leafStep;
          const ly = height * 0.82;
          nodes.push({
            id: devId,
            label: `D${assignedLeaves + 1}`,
            x: lx,
            y: ly,
          });
          links.push({
            id: `link-${bId}-${devId}`,
            source: bId,
            target: devId,
          });
          assignedLeaves++;
        }
      }
      break;
    }
  }

  return { nodes, links };
}

/**
 * Analyzes connectivity, isolated nodes, and points of failure.
 */
export function analyzeTopology(
  type: TopologyType,
  nodes: TopologyNode[],
  links: TopologyLink[]
): TopologyAnalysis {
  const activeNodes = nodes.filter((n) => !n.failed);
  const activeLinks = links.filter((l) => !l.failed);
  const activeNodeIds = new Set(activeNodes.map((n) => n.id));

  // Build adjacency
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));

  activeLinks.forEach((link) => {
    if (activeNodeIds.has(link.source) && activeNodeIds.has(link.target)) {
      adj.get(link.source)!.push(link.target);
      adj.get(link.target)!.push(link.source);
    }
  });

  // Find connected components using BFS among non-failed end devices
  const visited = new Set<string>();
  const components: string[][] = [];

  activeNodes.forEach((node) => {
    if (!visited.has(node.id)) {
      const comp: string[] = [];
      const queue = [node.id];
      visited.add(node.id);

      while (queue.length > 0) {
        const cur = queue.shift()!;
        comp.push(cur);
        const neighbors = adj.get(cur) || [];
        for (const next of neighbors) {
          if (!visited.has(next)) {
            visited.add(next);
            queue.push(next);
          }
        }
      }
      components.push(comp);
    }
  });

  const endDevices = activeNodes.filter((n) => !n.isHub && !n.id.startsWith('tap-'));
  const isolated = endDevices
    .filter((d) => (adj.get(d.id)?.length || 0) === 0)
    .map((d) => d.label || d.id);

  // Theoretical metrics
  const n = endDevices.length + nodes.filter((node) => node.failed && !node.isHub && !node.id.startsWith('tap-')).length;
  let theoreticalLinks = 0;
  let ports = '';

  switch (type) {
    case 'mesh':
      theoreticalLinks = (n * (n - 1)) / 2;
      ports = `${n - 1} ports per device`;
      break;
    case 'star':
      theoreticalLinks = n;
      ports = `1 port per device, ${n} ports on central hub`;
      break;
    case 'ring':
      theoreticalLinks = n;
      ports = '2 ports per device (input & output)';
      break;
    case 'bus':
      theoreticalLinks = n;
      ports = '1 drop cable port / transceiver tap';
      break;
    case 'tree':
      theoreticalLinks = nodes.length - 1;
      ports = '1 port per device, multi-port switches';
      break;
  }

  // Find Single Points of Failure (SPOF)
  const spof: string[] = [];
  if (type === 'star') {
    spof.push('Central Hub/Switch (failure isolates all devices)');
  } else if (type === 'ring') {
    spof.push('Any single link or node (in a single unidirectional ring)');
  } else if (type === 'bus') {
    spof.push('Main backbone cable break (splits network and creates impedance reflections)');
  } else if (type === 'tree') {
    spof.push('Root switch or higher-tier hub');
  }

  // Check if all active non-hub devices are in the same component
  const isFullyConnected =
    components.length === 1 && isolated.length === 0 && endDevices.length > 0;

  let faultToleranceNote = '';
  if (!isFullyConnected) {
    faultToleranceNote = `Network split! ${components.length} disconnected partitions detected. ${isolated.length} device(s) isolated.`;
  } else if (type === 'mesh') {
    faultToleranceNote =
      'Outstanding fault tolerance: Multiple redundant paths prevent any single link failure from causing downtime.';
  } else {
    faultToleranceNote =
      'Network currently communicating normally, but single points of failure exist.';
  }

  return {
    totalNodes: nodes.length,
    activeNodes: activeNodes.length,
    totalLinks: links.length,
    activeLinks: activeLinks.length,
    theoreticalLinks,
    portsPerDevice: ports,
    connectedComponents: components,
    isolatedNodes: isolated,
    isFullyConnected,
    singlePointsOfFailure: spof,
    faultToleranceNote,
  };
}
