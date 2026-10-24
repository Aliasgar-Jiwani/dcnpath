import type { Unit } from './types';

export const unit4: Unit = {
  id: 'unit-4',
  number: 4,
  title: 'Data Link Control',
  courseOutcome: 'CO4',
  hours: 9,
  objectives: [
    'Explain line discipline, flow control, and error control mechanisms',
    'Compare Stop-and-Wait, Go-Back-N, and Selective Repeat ARQ protocols',
    'Understand HDLC framing, bit stuffing, and frame types',
    'Differentiate asynchronous and synchronous data link protocols',
  ],
  topics: [
    { id: 'u4-line-discipline', title: 'Line Discipline', summary: 'ENQ/ACK and poll/select.', body: 'Content will be added in step 4.', keyPoints: ['ENQ/ACK for point-to-point', 'Poll/Select for multipoint'], textbookRef: 'Forouzan, Ch. 10' },
    { id: 'u4-flow-control', title: 'Flow Control', summary: 'Stop-and-Wait and sliding window.', body: 'Content will be added in step 4.', keyPoints: ['Stop-and-Wait flow control', 'Sliding window protocol'], textbookRef: 'Forouzan, Ch. 10' },
    { id: 'u4-error-control', title: 'Error Control (ARQ)', summary: 'Stop-and-Wait, Go-Back-N, and Selective Repeat ARQ.', body: 'Content will be added in step 4.', formulas: ['GBN: N ≤ 2^m − 1', 'SR: N ≤ 2^(m−1)'], keyPoints: ['ARQ: Automatic Repeat Request', 'Stop-and-Wait ARQ', 'Go-Back-N ARQ', 'Selective Repeat ARQ'], textbookRef: 'Forouzan, Ch. 11', sim: 'arq-simulator' },
    { id: 'u4-protocols', title: 'Asynchronous & Synchronous Protocols', summary: 'Character-oriented and bit-oriented protocols.', body: 'Content will be added in step 4.', keyPoints: ['BISYNC (character-oriented)', 'HDLC, SDLC (bit-oriented)'], textbookRef: 'Forouzan, Ch. 11' },
    { id: 'u4-hdlc', title: 'HDLC Framing', summary: 'HDLC frame structure and bit stuffing.', body: 'Content will be added in step 4.', keyPoints: ['Flag, Address, Control, Data, FCS', 'Bit stuffing with 0 after five 1s'], textbookRef: 'Forouzan, Ch. 11', sim: 'hdlc-framing' },
  ],
};
