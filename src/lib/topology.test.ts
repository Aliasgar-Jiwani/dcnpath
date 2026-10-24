import { describe, it, expect } from 'vitest';
import { generateTopology, analyzeTopology } from './topology';

describe('Network Topologies (Forouzan Ch. 1)', () => {
  it('generates mesh topology with n(n-1)/2 physical links', () => {
    const { nodes, links } = generateTopology('mesh', 5);
    expect(nodes.length).toBe(5);
    // 5 * 4 / 2 = 10 links
    expect(links.length).toBe(10);

    const analysis = analyzeTopology('mesh', nodes, links);
    expect(analysis.isFullyConnected).toBe(true);
    expect(analysis.isolatedNodes.length).toBe(0);
    expect(analysis.theoreticalLinks).toBe(10);
  });

  it('generates star topology with n links and central hub', () => {
    const { nodes, links } = generateTopology('star', 6);
    // 6 end devices + 1 hub = 7 nodes
    expect(nodes.length).toBe(7);
    expect(links.length).toBe(6);

    const hub = nodes.find((n) => n.isHub);
    expect(hub).toBeDefined();

    const analysis = analyzeTopology('star', nodes, links);
    expect(analysis.singlePointsOfFailure.length).toBeGreaterThan(0);
  });

  it('detects isolated nodes when a link or device fails', () => {
    const { nodes, links } = generateTopology('star', 4);
    // Fail one link
    links[0].failed = true;
    const analysis = analyzeTopology('star', nodes, links);
    expect(analysis.isolatedNodes.length).toBe(1);
    expect(analysis.isFullyConnected).toBe(false);
  });

  it('generates ring topology with n links', () => {
    const { nodes, links } = generateTopology('ring', 5);
    expect(nodes.length).toBe(5);
    expect(links.length).toBe(5);
  });
});
