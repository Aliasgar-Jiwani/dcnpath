/**
 * Multiplexing Algorithms: FDM, WDM, Synchronous TDM, and Statistical TDM
 * Forouzan Chapter 6
 */

export interface FdmChannel {
  id: string;
  name: string;
  centerFreq: number; // kHz
  bandwidth: number; // kHz
  color: string;
}

export interface FdmResult {
  channels: FdmChannel[];
  guardBand: number; // kHz
  totalBandwidth: number;
  carrierFrequencies: number[];
  efficiency: number;
}

export function calculateFdm(
  channelCount: number,
  channelBandwidth: number,
  guardBand: number,
  baseFrequency: number = 20
): FdmResult {
  const n = Math.max(2, Math.min(8, channelCount));
  const channels: FdmChannel[] = [];
  const carrierFrequencies: number[] = [];
  const colors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
  ];

  let currentFreq = baseFrequency;

  for (let i = 0; i < n; i++) {
    const center = currentFreq + channelBandwidth / 2;
    carrierFrequencies.push(center);
    channels.push({
      id: `ch-${i + 1}`,
      name: `Source ${i + 1}`,
      centerFreq: center,
      bandwidth: channelBandwidth,
      color: colors[i % colors.length] ?? '#3b82f6',
    });
    currentFreq += channelBandwidth + guardBand;
  }

  const totalBandwidth = n * channelBandwidth + (n - 1) * guardBand;
  const usefulBandwidth = n * channelBandwidth;
  const efficiency = totalBandwidth > 0 ? (usefulBandwidth / totalBandwidth) * 100 : 0;

  return {
    channels,
    guardBand,
    totalBandwidth,
    carrierFrequencies,
    efficiency: Number(efficiency.toFixed(1)),
  };
}

export interface TdmSource {
  id: string;
  label: string;
  dataBuffer: string[]; // packets or characters
  active: boolean;
}

export interface SyncTdmSlot {
  slotIndex: number;
  sourceId: string;
  sourceLabel: string;
  data: string | null; // null means wasted empty slot
  isFramingBit?: boolean;
}

export interface SyncTdmFrame {
  frameIndex: number;
  slots: SyncTdmSlot[];
  framingBit: '0' | '1';
  utilization: number; // percentage of slots with actual data
}

/**
 * Simulates Synchronous TDM frame generation.
 * In Sync TDM, every frame dedicates exactly 1 slot per source, plus 1 framing bit.
 */
export function simulateSyncTdm(
  sources: TdmSource[],
  frameCount: number = 4
): {
  frames: SyncTdmFrame[];
  totalSlots: number;
  usedSlots: number;
  wastedSlots: number;
  overallEfficiency: number;
} {
  const frames: SyncTdmFrame[] = [];
  let totalSlots = 0;
  let usedSlots = 0;

  for (let f = 0; f < frameCount; f++) {
    const slots: SyncTdmSlot[] = [];
    let frameUsed = 0;

    sources.forEach((src, idx) => {
      const bufData = src.dataBuffer[f];
      const data = src.active && bufData !== undefined ? bufData : null;
      if (data !== null) {
        frameUsed++;
        usedSlots++;
      }
      totalSlots++;
      slots.push({
        slotIndex: idx,
        sourceId: src.id,
        sourceLabel: src.label,
        data,
      });
    });

    frames.push({
      frameIndex: f + 1,
      slots,
      framingBit: (f % 2).toString() as '0' | '1',
      utilization: sources.length > 0 ? (frameUsed / sources.length) * 100 : 0,
    });
  }

  const wastedSlots = totalSlots - usedSlots;
  const overallEfficiency = totalSlots > 0 ? (usedSlots / totalSlots) * 100 : 0;

  return {
    frames,
    totalSlots,
    usedSlots,
    wastedSlots,
    overallEfficiency: Number(overallEfficiency.toFixed(1)),
  };
}

export interface StatTdmSlot {
  slotIndex: number;
  sourceId: string;
  sourceAddress: string; // address bits identifying the source
  data: string;
}

export interface StatTdmFrame {
  frameIndex: number;
  capacity: number; // max slots per frame
  slots: StatTdmSlot[];
  utilization: number;
}

/**
 * Simulates Statistical (Asynchronous) TDM frame generation.
 * Slots are dynamically allocated only to active sources with queued data.
 */
export function simulateStatTdm(
  sources: TdmSource[],
  frameSlotCapacity: number = 3,
  frameCount: number = 4
): {
  frames: StatTdmFrame[];
  queuedRemaining: number;
  overallEfficiency: number;
} {
  // Collect all ready items in FIFO queue
  const queue: { sourceId: string; sourceLabel: string; address: string; data: string }[] = [];
  const addressBits = Math.ceil(Math.log2(Math.max(2, sources.length)));

  for (let step = 0; step < frameCount; step++) {
    sources.forEach((src, i) => {
      const stepData = src.dataBuffer[step];
      if (src.active && stepData !== undefined) {
        queue.push({
          sourceId: src.id,
          sourceLabel: src.label,
          address: i.toString(2).padStart(addressBits, '0'),
          data: stepData,
        });
      }
    });
  }

  const frames: StatTdmFrame[] = [];
  let totalCapacity = 0;
  let filledCapacity = 0;

  for (let f = 0; f < frameCount; f++) {
    const slots: StatTdmSlot[] = [];
    for (let s = 0; s < frameSlotCapacity && queue.length > 0; s++) {
      const item = queue.shift()!;
      slots.push({
        slotIndex: s,
        sourceId: item.sourceId,
        sourceAddress: item.address,
        data: item.data,
      });
      filledCapacity++;
    }
    totalCapacity += frameSlotCapacity;

    frames.push({
      frameIndex: f + 1,
      capacity: frameSlotCapacity,
      slots,
      utilization: frameSlotCapacity > 0 ? (slots.length / frameSlotCapacity) * 100 : 0,
    });
  }

  const overallEfficiency = totalCapacity > 0 ? (filledCapacity / totalCapacity) * 100 : 0;

  return {
    frames,
    queuedRemaining: queue.length,
    overallEfficiency: Number(overallEfficiency.toFixed(1)),
  };
}
