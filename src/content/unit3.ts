import type { Unit } from './types';

export const unit3: Unit = {
  id: 'unit-3',
  number: 3,
  title: 'Multiplexing and Error Control',
  courseOutcome: 'CO3',
  hours: 9,
  objectives: [
    'Explain FDM, WDM, and TDM multiplexing techniques',
    'Describe the telephone system multiplexing hierarchy',
    'Identify types of errors in data communication',
    'Implement VRC, LRC, CRC, and checksum error detection',
    'Understand Hamming code for error correction',
  ],
  topics: [
    { id: 'u3-mux', title: 'Multiplexing', summary: 'FDM, WDM, synchronous TDM, and statistical TDM.', body: 'Content will be added in step 3.', keyPoints: ['FDM, WDM, sync TDM, stat TDM'], textbookRef: 'Forouzan, Ch. 6', sim: 'multiplexing' },
    { id: 'u3-telephone', title: 'Telephone System', summary: 'The PSTN multiplexing hierarchy.', body: 'Content will be added in step 3.', keyPoints: ['T-1 (DS-1), T-3, E-1 lines'], textbookRef: 'Forouzan, Ch. 6' },
    { id: 'u3-errors', title: 'Types of Errors', summary: 'Single-bit and burst errors.', body: 'Content will be added in step 3.', keyPoints: ['Single-bit error', 'Burst error'], textbookRef: 'Forouzan, Ch. 9' },
    { id: 'u3-parity', title: 'VRC and LRC', summary: 'Parity-based error detection.', body: 'Content will be added in step 3.', keyPoints: ['VRC (even/odd parity)', 'LRC (2D parity)'], textbookRef: 'Forouzan, Ch. 9', sim: 'parity-lrc' },
    { id: 'u3-crc', title: 'CRC', summary: 'Cyclic Redundancy Check using polynomial division.', body: 'Content will be added in step 3.', formulas: ['CRC = Data × x^r mod Generator'], keyPoints: ['Polynomial division', 'Burst error detection'], textbookRef: 'Forouzan, Ch. 9', sim: 'crc-division' },
    { id: 'u3-checksum', title: 'Checksum', summary: "One's complement checksum.", body: 'Content will be added in step 3.', keyPoints: ["One's complement sum", 'Wrap-around carry'], textbookRef: 'Forouzan, Ch. 9', sim: 'checksum' },
    { id: 'u3-hamming', title: 'Hamming Code', summary: 'Error correction with redundant bits.', body: 'Content will be added in step 3.', formulas: ['2^r ≥ m + r + 1'], keyPoints: ['Hamming distance', 'Syndrome for error location'], textbookRef: 'Forouzan, Ch. 9', sim: 'hamming' },
  ],
};
