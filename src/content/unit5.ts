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
    {
      id: 'u5-ethernet',
      title: 'Ethernet (CSMA/CD)',
      summary: 'IEEE 802.3 and carrier sensing with collision detection.',
      body: `**Ethernet** is the dominant LAN technology, standardised as **IEEE 802.3**. Ethernet uses **CSMA/CD (Carrier Sense Multiple Access with Collision Detection)** as its medium access control (MAC) protocol. CSMA/CD allows multiple stations to share a common transmission medium (bus or hub) by sensing the carrier signal before transmitting and detecting collisions when they occur.

**CSMA/CD Algorithm:**
1. **Carrier Sense:** A station wishing to transmit first listens to the medium. If the medium is idle (no carrier signal detected), the station begins transmitting. If busy, the station defers (waits).
2. **Transmission with Collision Detection:** While transmitting, the station continues to monitor the medium. If it detects that the signal on the medium differs from what it is transmitting (a collision has occurred), it immediately stops sending its frame.
3. **Jam Signal:** After detecting a collision, the station sends a short **jam signal** (48 bits) to ensure all other stations also detect the collision.
4. **Binary Exponential Backoff:** After a collision, the station waits a random time before attempting to retransmit. The waiting time is selected from {0, 1, 2, …, 2^k − 1} × slot time, where k = min(collision count, 10). The **slot time** for 10 Mbps Ethernet is 51.2 μs. After 16 consecutive collisions, the station reports a failure to the upper layer.

**Minimum Frame Size:**
For collision detection to work, the frame must be long enough for the sender to still be transmitting when a collision signal propagates back from the farthest point on the network. For 10 Mbps Ethernet with a maximum cable length of 2500 m, the minimum frame size is **64 bytes (512 bits)**. Frames shorter than 64 bytes are padded.

**Ethernet Frame Format (IEEE 802.3):**
| Preamble (7B) | SFD (1B) | Dest Addr (6B) | Src Addr (6B) | Length/Type (2B) | Data (46–1500B) | FCS (4B) |

The preamble (7 bytes of 10101010) synchronises the receiver's clock. The SFD (Start Frame Delimiter = 10101011) marks the start of the frame.

**Ethernet Speeds:**
- **10Base-T:** 10 Mbps over UTP Cat 3, star topology with hub, 100 m max segment
- **100Base-TX (Fast Ethernet):** 100 Mbps over UTP Cat 5, uses 4B/5B + MLT-3 encoding
- **Gigabit Ethernet (1000Base-T):** 1 Gbps over UTP Cat 5e/6, uses 4-pair PAM-5 encoding
- **10 Gigabit Ethernet:** 10 Gbps, typically over fibre; full-duplex only (no CSMA/CD)`,
      formulas: [
        'Backoff time = R × slot_time, R ∈ {0, 1, …, 2^k − 1}, k = min(n, 10)',
        'Slot time (10 Mbps) = 51.2 μs = 512 bit times',
        'Minimum frame size = 64 bytes (512 bits)',
        'Maximum frame size = 1518 bytes (including headers and FCS)',
      ],
      keyPoints: [
        'CSMA/CD: listen before sending, detect collisions, binary exponential backoff',
        'Minimum frame = 64 bytes ensures collision detection across maximum network span',
        'Jam signal = 48 bits; max 16 retransmission attempts',
        '10Base-T → 100Base-TX → 1000Base-T → 10GbE evolution',
        '10 Gigabit Ethernet uses full-duplex only; CSMA/CD is unnecessary',
      ],
      textbookRef: 'Forouzan, Ch. 12',
      sim: 'csma-cd',
    },
    {
      id: 'u5-token',
      title: 'Token Ring and Token Bus',
      summary: 'Token-passing access methods.',
      body: `Token-passing protocols provide **deterministic** medium access — unlike CSMA/CD's probabilistic approach, token passing guarantees that each station gets a turn to transmit within a bounded maximum time.

**IEEE 802.5 Token Ring:**
Stations are connected in a physical ring (or star-wired ring using a MAU — Multistation Access Unit). A special 3-byte frame called a **token** circulates around the ring. A station may transmit only when it captures the (free) token.

**Token Ring Operation:**
1. A free token (T=0 in the Access Control byte) circulates continuously around the ring.
2. When a station has data to send, it waits for the free token, captures it, changes the token bit from 0 (free) to 1 (busy), and appends its data frame.
3. The frame travels around the ring. Each station examines the destination address. The destination station copies the frame and sets acknowledgment bits (A and C bits) in the frame's status field.
4. The frame continues around the ring back to the sender. The sender verifies successful delivery by checking the A and C bits, then removes the frame from the ring and releases a new free token.

Token Ring supports **priority levels (0–7)** using Reservation and Priority bits in the Access Control byte, allowing high-priority stations to reserve the next token.

**IEEE 802.4 Token Bus:**
Combines the physical topology of a bus (all stations on a single cable, like Ethernet) with the logical access method of token passing. Stations are organised into a **logical ring** based on their addresses. The token is passed in descending address order. When a station receives the token, it may transmit for a limited time before passing the token to the next station in the logical ring.

Token Bus was designed for factory automation (MAP — Manufacturing Automation Protocol) where deterministic access was critical.

**FDDI (Fiber Distributed Data Interface):**
FDDI is a token-passing LAN/MAN running at **100 Mbps** over fibre-optic cable. It uses a **dual-ring** architecture with counter-rotating rings (primary and secondary). Under normal operation, only the primary ring carries data. If a cable break or station failure occurs, the secondary ring wraps around the break point, maintaining connectivity — this is called **ring wrapping** or **self-healing**.

FDDI uses **timed token rotation** to manage bandwidth: each station has a Target Token Rotation Time (TTRT). If the token arrives early (before TTRT), the station can send both synchronous (guaranteed bandwidth) and asynchronous (best-effort) data. If the token arrives late, only synchronous data is permitted. FDDI supports up to 500 stations over 100 km (200 km of total fibre).`,
      formulas: [
        'Token Ring max stations: 250 (shielded) or 72 (unshielded)',
        'FDDI data rate: 100 Mbps over 100 km dual ring',
        'Token Holding Time (THT) = TTRT − actual rotation time',
      ],
      keyPoints: [
        'Token Ring (802.5): physical ring, token gives permission to transmit; deterministic access',
        'Sender removes its frame from ring after it circulates back; releases new token',
        'Token Bus (802.4): physical bus with logical ring; used in factory automation (MAP)',
        'FDDI: 100 Mbps fibre, dual counter-rotating rings for fault tolerance (self-healing)',
        'FDDI timed token rotation: early token → sync + async; late token → sync only',
      ],
      textbookRef: 'Forouzan, Ch. 12',
      sim: 'token-ring',
    },
    {
      id: 'u5-switching',
      title: 'Switching',
      summary: 'Circuit, packet, and message switching.',
      body: `**Switching** is the mechanism by which data is routed from source to destination through a network of intermediate nodes. The three fundamental switching techniques are circuit switching, packet switching, and message switching.

**Circuit Switching:**
A dedicated communication path is established between the sender and receiver **before** any data is transmitted. The path remains exclusively reserved for the duration of the entire communication session, regardless of whether data is actively being sent.

Circuit switching involves three phases:
1. **Connection Establishment:** A dedicated path is set up through the network by reserving a circuit on each intermediate link.
2. **Data Transfer:** Data flows continuously along the established path with guaranteed bandwidth and minimal delay.
3. **Connection Teardown:** After communication ends, the circuit is released and the resources become available for other users.

The **Public Switched Telephone Network (PSTN)** is the classic example of circuit switching. Advantages: guaranteed bandwidth, constant delay, no congestion during transfer. Disadvantages: setup delay, wasted capacity during silences (voice calls are idle ~60% of the time), dedicated resources even when not transmitting.

**Packet Switching:**
Data is divided into small, fixed or variable-size units called **packets**. Each packet carries header information (source address, destination address, sequence number) and is independently routed through the network. There is no dedicated path — packets may take different routes and arrive out of order.

Two variants exist:
- **Datagram** (connectionless): Each packet is routed independently. No setup phase. Packets may arrive out of order and must be resequenced. Used in the Internet (IP).
- **Virtual Circuit** (connection-oriented): A logical path is established before data transfer (like circuit switching), but resources are not exclusively dedicated. Packets follow the same path and arrive in order. Used in ATM and Frame Relay.

**Message Switching (Store-and-Forward):**
The entire message is transmitted as a single unit from node to node. Each intermediate node receives and stores the complete message, checks it for errors, and then forwards it to the next node. No dedicated path is established.

Advantages: better bandwidth utilisation than circuit switching (links shared). Disadvantages: each intermediate node must have sufficient storage for the entire message, causing potentially long delays. Message switching is rarely used today — it has been largely superseded by packet switching.`,
      formulas: [
        'Circuit switching delay = setup time + transmission time + propagation delay',
        'Packet switching delay per hop = queuing + transmission + propagation',
        'Total packet delay = Σ (per-hop delays) across all hops',
      ],
      keyPoints: [
        'Circuit switching: dedicated path, 3 phases (setup, transfer, teardown); PSTN example',
        'Packet switching: data divided into packets, independently routed; datagram vs virtual circuit',
        'Datagram: connectionless, packets may arrive out of order (IP)',
        'Virtual circuit: connection-oriented logical path, packets in order (ATM, Frame Relay)',
        'Message switching: store-and-forward entire message; obsolete, replaced by packet switching',
      ],
      textbookRef: 'Forouzan, Ch. 8',
      sim: 'switching-compare',
    },
    {
      id: 'u5-isdn',
      title: 'ISDN',
      summary: 'Integrated Services Digital Network.',
      body: `**ISDN (Integrated Services Digital Network)** is a set of ITU-T standards for digital transmission over ordinary telephone copper wire. ISDN was designed to provide end-to-end digital connectivity, supporting voice, data, text, graphics, and video over the same network infrastructure.

**ISDN Channels:**
ISDN defines three types of channels:
- **B channel (Bearer channel):** Carries user data (voice, video, or data) at **64 kbps** (one DS-0 channel). B channels are circuit-switched or packet-switched.
- **D channel (Delta channel):** Carries signalling and control information using the LAPD protocol. In BRI, the D channel runs at 16 kbps. In PRI, it runs at 64 kbps. The D channel can also carry low-speed packet data when not busy with signalling.
- **H channel (High-speed channel):** Provides higher data rates by combining multiple B channels. H0 = 384 kbps (6B), H11 = 1.536 Mbps (24B), H12 = 1.920 Mbps (30B).

**ISDN Interfaces:**
- **BRI (Basic Rate Interface):** 2B + D = 2 × 64 + 16 = **144 kbps** user data, with framing overhead totaling **192 kbps** on the wire. Designed for residential and small office use. Two simultaneous voice calls or one voice + one data connection.
- **PRI (Primary Rate Interface):**
  - North America/Japan: 23B + D = 23 × 64 + 64 = **1.544 Mbps** (same as T-1)
  - Europe: 30B + D = 30 × 64 + 64 = **2.048 Mbps** (same as E-1)

**ISDN Reference Points and Functional Groups:**
ISDN defines reference points (R, S, T, U) that represent the boundaries between functional devices:
- **TE1 (Terminal Equipment 1):** ISDN-compatible device (e.g., ISDN phone, data terminal)
- **TE2 (Terminal Equipment 2):** Non-ISDN device (e.g., standard analog phone, RS-232 terminal)
- **TA (Terminal Adapter):** Converts TE2 signals to ISDN format (like a modem for ISDN)
- **NT1 (Network Termination 1):** Converts between 2-wire U interface (subscriber loop) and 4-wire S/T interface. Performs line coding and physical layer functions.
- **NT2 (Network Termination 2):** Intelligent device like a PBX or LAN router that performs switching, multiplexing, and concentration.

The reference points are: R (between TE2 and TA), S (between TE1/TA and NT2), T (between NT2 and NT1), and U (between NT1 and the telephone exchange).

**Broadband ISDN (B-ISDN):** An extension of ISDN designed for high-bandwidth services using ATM (Asynchronous Transfer Mode) as the switching technology and SONET/SDH as the physical transport. B-ISDN supports data rates from 155.52 Mbps (OC-3) to 622.08 Mbps (OC-12) and beyond.`,
      formulas: [
        'BRI: 2B + D = 2 × 64 + 16 = 144 kbps (192 kbps on wire)',
        'PRI (NA): 23B + D = 23 × 64 + 64 = 1.544 Mbps',
        'PRI (EU): 30B + D = 30 × 64 + 64 = 2.048 Mbps',
      ],
      keyPoints: [
        'BRI: 2B + D (192 kbps); residential/small office; two simultaneous calls',
        'PRI: 23B + D (T-1, NA) or 30B + D (E-1, EU); enterprise use',
        'B channel = 64 kbps user data; D channel = signalling (16 or 64 kbps)',
        'Reference points: R, S, T, U between functional groups (TE, TA, NT1, NT2)',
        'B-ISDN uses ATM switching over SONET/SDH for broadband services',
      ],
      textbookRef: 'Forouzan, Ch. 17',
      sim: 'isdn-channels',
    },
    {
      id: 'u5-dqdb',
      title: 'IEEE 802.6 (DQDB) and SMDS',
      summary: 'MAN standards.',
      body: `**IEEE 802.6** defines the standard for Metropolitan Area Networks (MANs) using a technology called **DQDB (Distributed Queue Dual Bus)**. DQDB was designed to provide high-speed data, voice, and video communication across an entire metropolitan area (city-wide coverage, typically 50–100 km).

**DQDB Architecture:**
DQDB uses two unidirectional buses running in opposite directions (Bus A and Bus B). Stations are connected to both buses. Each bus has a head-end station (slot generator) that continuously generates empty 53-byte **slots** at a fixed rate. Data flows in one direction on Bus A and in the opposite direction on Bus B.

To send data from station X to station Y:
- If Y is downstream on Bus A, station X writes its data into an empty slot on Bus A.
- If Y is downstream on Bus B, station X writes into a slot on Bus B.

**Distributed Queue Protocol:**
The "distributed queue" mechanism ensures fair access to each bus. Each station maintains two counters per bus:
- **Request Counter (RC):** Counts the number of outstanding requests from downstream stations (requests propagate on the opposite bus).
- **Countdown Counter (CD):** When a station wants to transmit, it copies the current RC value into CD. It then lets CD empty slots pass (giving priority to earlier requests), transmitting its data in the next empty slot when CD reaches 0.

This creates a distributed FIFO queue — stations are served in the order they made their requests, regardless of their physical position on the bus.

**Slot Format:**
Each DQDB slot is 53 bytes (matching ATM cell size for B-ISDN compatibility):
- 1 byte Access Control Field (Busy bit, Slot Type, Request bits, PSR)
- 52 bytes Segment (5 bytes header + 44 bytes data + 2 bytes trailer)

**SMDS (Switched Multimegabit Data Service):**
SMDS is a connectionless, packet-switched data service offered by telephone companies over DQDB infrastructure. SMDS provides high-speed LAN-to-LAN connectivity across a metropolitan area at rates from 1.544 Mbps (DS-1) to 44.736 Mbps (DS-3). SMDS uses the DQDB slot format and addressing scheme.

SMDS allows multiple LANs within a city to communicate as if they were on the same network, without the need for dedicated leased lines. However, SMDS has been largely superseded by Metro Ethernet, MPLS, and modern IP-based MAN technologies.`,
      formulas: [
        'DQDB slot size = 53 bytes (matching ATM cell)',
        'DQDB segment payload = 44 bytes per slot',
        'SMDS rates: DS-1 (1.544 Mbps) to DS-3 (44.736 Mbps)',
      ],
      keyPoints: [
        'DQDB: Distributed Queue Dual Bus — two unidirectional buses, 53-byte slots',
        'Distributed queue: RC and CD counters ensure FIFO fairness',
        'DQDB slot = 53 bytes to match ATM cell format (B-ISDN compatibility)',
        'SMDS: connectionless packet-switched service over DQDB for MAN connectivity',
        'SMDS largely replaced by Metro Ethernet and MPLS',
      ],
      textbookRef: 'Forouzan, Ch. 14',
    },
  ],
};
