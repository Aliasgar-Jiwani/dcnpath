import type { Unit } from './types';

export const unit5: Unit = {
  id: 'unit-5',
  number: 5,
  title: 'Local Area Networks',
  courseOutcome: 'CO5',
  hours: 9,
  objectives: [
    'Explain Ethernet and IEEE 802.3 standards',
    'Compare token-passing protocols: Token Bus and Token Ring',
    'Describe FDDI and its dual-ring architecture',
    'Differentiate circuit, packet, and message switching',
    'Understand ISDN services, BRI, and PRI',
  ],
  topics: [
    { id: 'u5-ethernet', title: 'Ethernet (CSMA/CD)', summary: 'IEEE 802.3 and carrier sensing with collision detection.', body: 'Content will be added in step 5.', keyPoints: ['CSMA/CD algorithm', 'Binary exponential backoff', '10Base-T, 100Base-TX, Gigabit Ethernet'], textbookRef: 'Forouzan, Ch. 12', sim: 'csma-cd' },
    { id: 'u5-token', title: 'Token Ring and Token Bus', summary: 'Token-passing access methods.', body: 'Content will be added in step 5.', keyPoints: ['IEEE 802.5 Token Ring', 'IEEE 802.4 Token Bus', 'FDDI dual ring'], textbookRef: 'Forouzan, Ch. 12', sim: 'token-ring' },
    { id: 'u5-switching', title: 'Switching', summary: 'Circuit, packet, and message switching.', body: 'Content will be added in step 5.', keyPoints: ['Circuit switching: dedicated path', 'Packet switching: datagram and virtual circuit', 'Message switching: store-and-forward'], textbookRef: 'Forouzan, Ch. 8', sim: 'switching-compare' },
    { id: 'u5-isdn', title: 'ISDN', summary: 'Integrated Services Digital Network.', body: 'Content will be added in step 5.', keyPoints: ['BRI: 2B + D (192 kbps)', 'PRI: 23B + D or 30B + D', 'NT1, TE, TA reference points'], textbookRef: 'Forouzan, Ch. 17', sim: 'isdn-channels' },
    { id: 'u5-dqdb', title: 'IEEE 802.6 (DQDB) and SMDS', summary: 'MAN standards.', body: 'Content will be added in step 5.', keyPoints: ['DQDB: Distributed Queue Dual Bus', 'SMDS: Switched Multimegabit Data Service'], textbookRef: 'Forouzan, Ch. 14' },
  ],
};
