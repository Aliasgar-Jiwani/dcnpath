import { describe, it, expect } from 'vitest';
import { calculateFdm, simulateSyncTdm, simulateStatTdm } from './multiplexing';

describe('Multiplexing: FDM and TDM (Forouzan Ch. 6)', () => {
  it('calculates FDM bandwidth including guard bands', () => {
    // 3 channels of 4 kHz each with 1 kHz guard band
    // Total bandwidth = 3 * 4 + 2 * 1 = 14 kHz
    const res = calculateFdm(3, 4, 1, 20);
    expect(res.channels.length).toBe(3);
    expect(res.totalBandwidth).toBe(14);
    expect(res.carrierFrequencies).toEqual([22, 27, 32]);
    expect(res.efficiency).toBeCloseTo((12 / 14) * 100, 1);
  });

  it('simulates synchronous TDM slot allocation and detects wasted slots', () => {
    const sources = [
      { id: 's1', label: 'A', dataBuffer: ['A1', 'A2'], active: true },
      { id: 's2', label: 'B', dataBuffer: [], active: false }, // inactive source
    ];
    const tdm = simulateSyncTdm(sources, 2);
    expect(tdm.frames.length).toBe(2);
    expect(tdm.totalSlots).toBe(4); // 2 sources * 2 frames
    expect(tdm.usedSlots).toBe(2);
    expect(tdm.wastedSlots).toBe(2);
    expect(tdm.overallEfficiency).toBe(50);
  });

  it('simulates statistical TDM dynamic slot allocation without wasting slots', () => {
    const sources = [
      { id: 's1', label: 'A', dataBuffer: ['A1'], active: true },
      { id: 's2', label: 'B', dataBuffer: ['B1'], active: true },
    ];
    const stat = simulateStatTdm(sources, 2, 1);
    expect(stat.frames.length).toBe(1);
    expect(stat.frames[0].slots.length).toBe(2);
    expect(stat.overallEfficiency).toBe(100);
  });
});
