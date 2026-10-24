import type { Unit } from './types';

export const unit1: Unit = {
  id: 'unit-1',
  number: 1,
  title: 'Introduction to Data Communication',
  courseOutcome: 'CO1',
  hours: 9,
  objectives: [
    'Understand the fundamental components of a data communication system',
    'Differentiate between various network types and their characteristics',
    'Explain protocols, standards, and the role of standards bodies',
    'Identify and compare line configurations and topology types',
    'Distinguish between simplex, half-duplex, and full-duplex transmission modes',
    'Analyze analog and digital signals in both time and frequency domains',
    'Understand composite signals, bandwidth, and the frequency spectrum',
  ],
  topics: [
    {
      id: 'u1-components',
      title: 'Components of Data Communication',
      summary: 'The five building blocks every data communication system needs.',
      body: `Data communication is the exchange of data between two devices via some form of transmission medium such as a wire cable or wireless signal. For data communication to occur, the communicating devices must be part of a system made up of a combination of hardware (physical equipment) and software (programs).

The effectiveness of a data communication system depends on four fundamental characteristics: delivery (the system must deliver data to the correct destination), accuracy (the data must be delivered without alteration), timeliness (data must be delivered in a timely manner — late data is useless), and jitter (variation in packet arrival time that can degrade quality in audio and video).

Every data communication system is composed of five essential components. The **message** is the information to be communicated — text, numbers, images, audio, or video. The **sender** is the device that sends the message, such as a computer, workstation, or phone. The **receiver** is the device that receives the message. The **transmission medium** is the physical path by which a message travels from sender to receiver — twisted-pair wire, coaxial cable, fibre-optic cable, or radio waves. The **protocol** is a set of rules that govern data communication — it represents an agreement between the communicating devices.

A protocol defines what is communicated, how it is communicated, and when it is communicated. Without a protocol, two devices may be connected but unable to communicate, just like two people speaking different languages cannot understand each other.`,
      formulas: [],
      keyPoints: [
        'Five components: message, sender, receiver, medium, protocol',
        'Four effectiveness criteria: delivery, accuracy, timeliness, jitter',
        'Protocol = rules governing the communication',
        'Jitter is the variation in packet arrival time',
      ],
      textbookRef: 'Forouzan, Ch. 1 §1.1',
    },
    {
      id: 'u1-networks',
      title: 'Networks',
      summary: 'Types of networks by geographic scope: LAN, MAN, and WAN.',
      body: `A network is a set of devices (often referred to as nodes) connected by communication links. A node can be a computer, printer, or any other device capable of sending and/or receiving data. A link may be a cable, air, optical fibre, or any medium that carries information.

**Local Area Network (LAN)** — A LAN is usually privately owned and connects devices within a single office, building, or campus. LANs are designed to allow resources to be shared between personal computers or workstations. The size is limited to a few kilometres. Historically, LANs operated at data rates of 4 to 16 Mbps, but speeds of 100 Mbps to 10 Gbps are now common.

**Metropolitan Area Network (MAN)** — A MAN is designed to extend over an entire city. It may be a single network such as a cable television network, or it may be a means of connecting several LANs. A MAN might be owned and operated by a private company or a city authority. IEEE 802.6 (DQDB) is a standard designed for MANs.

**Wide Area Network (WAN)** — A WAN provides long-distance transmission of data, voice, image, and video information over large geographical areas that may comprise a country, a continent, or even the whole world. A WAN interconnects devices across large distances using leased lines, circuit switching, or packet switching. The Internet is an example of a WAN.

A key distinction: LANs are characterised by high data rate and low error rate, while WANs typically have lower data rate and higher error rate due to the distances involved.`,
      formulas: [],
      keyPoints: [
        'LAN: single building/campus, high speed, privately owned',
        'MAN: city-wide, e.g. cable TV network, IEEE 802.6',
        'WAN: country/continent scale, uses leased lines or switching',
        'The Internet is the largest WAN',
        'LAN → high rate, low error; WAN → lower rate, higher error',
      ],
      textbookRef: 'Forouzan, Ch. 1 §1.2',
    },
    {
      id: 'u1-protocols-standards',
      title: 'Protocols and Standards',
      summary: 'Rules of communication and the bodies that define them.',
      body: `In networking, a **protocol** is a set of rules that governs data communication. A protocol defines what is communicated, how it is communicated, and when it is communicated. The key elements of a protocol are syntax (the structure or format of data — the order in which fields are presented), semantics (the meaning of each section of bits — how a particular pattern is to be interpreted and what action is taken based on it), and timing (when data should be sent and how fast it can be sent).

**Standards** provide guidelines to manufacturers, vendors, government agencies, and other service providers to ensure the kind of interconnectivity necessary in today's marketplace. Standards fall into two categories: **de facto** (meaning "by fact" or "by convention") — standards that have been adopted through widespread use but have no formal approval, such as IBM PC architecture; and **de jure** (meaning "by law") — formal standards adopted by an officially recognised standards body, such as IEEE 802.3 for Ethernet.

Important standards organisations include the **ISO** (International Organization for Standardization) which developed the OSI model, the **ITU-T** (International Telecommunication Union) which develops standards for telephone and data communication, the **IEEE** (Institute of Electrical and Electronics Engineers) which develops LAN/MAN standards (802 family), and the **ANSI** (American National Standards Institute) which is the US representative to ISO.

The **Internet standards** follow a process: Internet Draft → Proposed Standard → Draft Standard → Internet Standard. RFCs (Requests for Comments) are the official documents of the IETF (Internet Engineering Task Force). Every Internet standard is published as an RFC, but not every RFC is a standard.`,
      formulas: [],
      keyPoints: [
        'Protocol elements: syntax, semantics, timing',
        'De facto = by practice; de jure = by official body',
        'ISO (OSI model), ITU-T (telecom), IEEE (802.x LAN/MAN), ANSI (US)',
        'Internet standard path: Draft → Proposed → Draft Standard → Standard',
        'RFCs are published by IETF',
      ],
      textbookRef: 'Forouzan, Ch. 1 §1.3–1.4',
    },
    {
      id: 'u1-line-config',
      title: 'Line Configuration',
      summary: 'Point-to-point and multipoint links between devices.',
      body: `Line configuration (also called link configuration) refers to the way two or more devices are connected to a link. A **link** is the physical communication pathway that transfers data from one device to another.

**Point-to-point** — A point-to-point connection provides a dedicated link between two devices. The entire capacity of the link is reserved for transmission between those two devices. Examples include changing TV channels with a remote control (infrared link between remote and TV) and a telephone line between two telephones.

**Multipoint (multidrop)** — In a multipoint connection, more than two specific devices share a single link. The capacity is shared, either spatially (multiple devices use the link simultaneously) or temporally (devices take turns using the link in a time-sharing arrangement). An example is a mainframe computer with several terminals connected via a single bus cable.

In a spatial sharing multipoint configuration, several devices can use the link simultaneously. In a temporal sharing (time-shared) multipoint configuration, users must take turns. The configuration choice affects cost, reliability, and complexity of the network.`,
      formulas: [],
      keyPoints: [
        'Point-to-point: dedicated link between exactly 2 devices',
        'Multipoint: multiple devices share one link',
        'Spatial sharing: simultaneous access',
        'Temporal sharing: time-based turn-taking',
      ],
      textbookRef: 'Forouzan, Ch. 2 §2.1',
    },
    {
      id: 'u1-topology',
      title: 'Topology',
      summary: 'Physical and logical arrangement of devices in a network.',
      body: `The term **topology** refers to the way in which a network is laid out physically. Two or more devices connect to a link; two or more links form a topology. The topology of a network is the geometric representation of the relationship of all the links and linking devices (nodes) to one another.

**Mesh topology** — Every device has a dedicated point-to-point link to every other device. For n devices, a fully connected mesh needs n(n−1)/2 duplex links and each device needs (n−1) I/O ports. Advantages: no traffic problems, robust (one link failure doesn't affect others), privacy, easy fault identification. Disadvantages: excessive cabling and I/O ports, impractical for large n.

**Star topology** — Each device has a dedicated point-to-point link to a central controller (hub or switch). Devices do not communicate directly; all traffic goes through the hub. Less expensive than mesh (n links and n ports). A single link failure isolates only that device, but a hub failure takes down the entire network.

**Bus topology** — All devices connect to a single long cable (the bus or backbone). Taps and drop lines connect stations to the bus. Less cabling than mesh or star. A fault in the bus cable stops all transmission. A break in the bus also reflects signals, causing errors.

**Ring topology** — Each device has a dedicated point-to-point connection with only the two devices on either side of it. A signal passes along the ring in one direction from device to device until it reaches its destination. A break in the ring can disable the entire network; this can be solved with a dual ring.

**Tree topology** — A variation of the star topology in which star-configured stations are connected to a linear bus backbone. Used in cable TV distribution.`,
      formulas: [
        'Mesh links: n(n − 1) / 2',
        'Mesh ports per device: n − 1',
      ],
      keyPoints: [
        'Mesh: full connectivity, n(n−1)/2 links, most robust but most expensive',
        'Star: central hub, n links, hub is single point of failure',
        'Bus: single backbone cable, cheap but fragile',
        'Ring: unidirectional token passing, break disables network',
        'Tree: hierarchy of star networks on a bus backbone',
      ],
      textbookRef: 'Forouzan, Ch. 2 §2.2',
      sim: 'topology-explorer',
    },
    {
      id: 'u1-transmission-mode',
      title: 'Transmission Mode',
      summary: 'Simplex, half-duplex, and full-duplex communication directions.',
      body: `The term **transmission mode** defines the direction of signal flow between two linked devices. There are three types.

**Simplex** — Communication is unidirectional, like a one-way street. Only one of the two devices can transmit; the other can only receive. Keyboards and traditional monitors are examples: the keyboard can only send data, and the monitor can only receive data. The entire bandwidth of the channel is used by the sender.

**Half-duplex** — Each station can both transmit and receive, but not at the same time. When one device is sending, the other can only receive, and vice versa. This is like a one-lane road with two-directional traffic — if cars come from both directions, one must wait. Walkie-talkies use half-duplex: only one person can talk at a time ("over").

**Full-duplex (duplex)** — Both stations can transmit and receive simultaneously. This is like a two-lane road with traffic flowing in both directions at the same time. The channel capacity is shared between the two directions. A telephone network is an example: both parties can talk and listen simultaneously. Full-duplex requires the medium to carry signals in both directions at once, or two separate paths.`,
      formulas: [],
      keyPoints: [
        'Simplex: one direction only (keyboard → CPU)',
        'Half-duplex: both directions, but not simultaneously (walkie-talkie)',
        'Full-duplex: both directions simultaneously (telephone)',
        'Full-duplex needs either two channels or a shared bidirectional medium',
      ],
      textbookRef: 'Forouzan, Ch. 2 §2.3',
    },
    {
      id: 'u1-analog-digital-signals',
      title: 'Analog and Digital Signals',
      summary: 'Continuous vs. discrete signals and how they encode information.',
      body: `Signals can be classified as **analog** or **digital**. An analog signal has infinitely many levels of intensity over a period of time — the signal changes smoothly and continuously. A digital signal can have only a limited number of defined values, often as simple as 1 and 0.

In data communication, we commonly use **periodic analog signals** and **non-periodic (aperiodic) digital signals**. A periodic signal completes a pattern within a measurable time frame called a period (T), and this pattern repeats. A non-periodic signal changes without exhibiting a pattern or cycle.

Both analog and digital signals can be periodic or non-periodic, but in practice: periodic analog signals (like sine waves) are used as building blocks for analysis, and non-periodic digital signals are the workhorse for actual data transmission.

The simplest periodic analog signal is the **sine wave**, described by three characteristics: peak amplitude (A) — the absolute value of its highest intensity; frequency (f) — the number of periods in one second, measured in Hertz (Hz); and phase (φ) — the position of the waveform relative to time 0. The mathematical representation is: s(t) = A sin(2πft + φ).`,
      formulas: [
        's(t) = A · sin(2πft + φ)',
        'T = 1/f  (period = inverse of frequency)',
        'f = 1/T  (frequency = inverse of period)',
      ],
      keyPoints: [
        'Analog = continuous; digital = discrete levels',
        'Periodic = repeating pattern; aperiodic = no pattern',
        'Sine wave: defined by amplitude (A), frequency (f), phase (φ)',
        'Period T = 1/f seconds',
        'Hz (Hertz) = cycles per second',
      ],
      textbookRef: 'Forouzan, Ch. 3 §3.1–3.2',
      sim: 'signal-viewer',
    },
    {
      id: 'u1-time-frequency-domain',
      title: 'Time and Frequency Domains',
      summary: 'Two ways to visualise a signal: amplitude-over-time and amplitude-over-frequency.',
      body: `A signal can be represented in two domains. The **time domain** plots signal amplitude against time — it shows how the signal changes over time. This is the familiar waveform view. Each sine wave can be fully characterised by its amplitude, frequency, and phase in the time domain.

The **frequency domain** shows the relationship between amplitude and frequency — it tells us what frequencies make up the signal and how much of each frequency is present. A simple sine wave in the time domain appears as a single spike (a single vertical line) in the frequency domain at its frequency f, with the height equal to its peak amplitude. This representation is also called the **spectrum** of the signal.

The frequency domain is useful because it simplifies the analysis of complex signals. A composite signal that looks complicated in the time domain can be decomposed into its component frequencies using **Fourier analysis**. Jean-Baptiste Fourier showed that any periodic signal can be decomposed into a (possibly infinite) sum of simple sine waves with different frequencies, amplitudes, and phases. This is the fundamental idea behind the **Fourier series**.

The **bandwidth** of a signal is the range of frequencies the signal contains. It is computed as the difference between the highest and lowest frequencies: BW = f_high − f_low. Bandwidth is one of the most important concepts in data communication because it determines the data-carrying capacity of a channel.`,
      formulas: [
        'Bandwidth BW = f_high − f_low',
        'Fourier: any periodic signal = Σ of sine waves',
      ],
      keyPoints: [
        'Time domain: amplitude vs. time (waveform)',
        'Frequency domain: amplitude vs. frequency (spectrum)',
        'Fourier analysis decomposes complex signals into sine components',
        'Bandwidth = highest frequency − lowest frequency',
        'Greater bandwidth → more data-carrying capacity',
      ],
      textbookRef: 'Forouzan, Ch. 3 §3.3',
      sim: 'signal-viewer',
    },
    {
      id: 'u1-composite-signals',
      title: 'Composite Signals',
      summary: 'How multiple sine waves combine to form real-world signals.',
      body: `A **composite signal** is a signal made up of multiple simple sine waves. According to Fourier analysis, any composite signal can be represented as a combination of simple sine waves with different frequencies, amplitudes, and phases.

If the composite signal is **periodic**, the decomposition gives a series of signals with discrete frequencies — frequencies that are integer multiples of the fundamental frequency. This is called a **Fourier series**. The fundamental frequency is the frequency of the lowest-frequency component, and the harmonics are at 2f, 3f, 4f, etc.

If the composite signal is **non-periodic**, the decomposition gives a continuous set of frequencies — the combination of an infinite number of sine waves with continuous (non-integer-multiple) frequencies. This is called the **Fourier transform**. Non-periodic signals have a continuous frequency spectrum rather than a discrete one.

A practical example: a square wave (commonly used in digital communication) can be approximated by adding odd harmonics of a sine wave — the fundamental frequency f, plus 3f, 5f, 7f, and so on, with decreasing amplitudes (1, 1/3, 1/5, 1/7, …). The more harmonics you include, the closer the approximation to a perfect square wave. This is why a channel needs sufficient bandwidth to carry the significant harmonics of a digital signal — otherwise the received signal will be distorted.

The concept of bandwidth is critical: a channel with a limited bandwidth will filter out the higher harmonics, degrading the signal. To preserve the shape of a digital signal (which theoretically has infinite bandwidth), we need a channel with bandwidth wide enough to pass the most significant harmonics.`,
      formulas: [
        'Square wave ≈ A·sin(2πft) + (A/3)·sin(2π·3ft) + (A/5)·sin(2π·5ft) + …',
        'n-th harmonic = n × fundamental frequency',
      ],
      keyPoints: [
        'Composite signal = sum of multiple sine waves',
        'Periodic → Fourier series (discrete harmonics)',
        'Non-periodic → Fourier transform (continuous spectrum)',
        'Square wave = sum of odd harmonics with 1/n amplitude',
        'Channel must pass enough harmonics to preserve signal shape',
      ],
      textbookRef: 'Forouzan, Ch. 3 §3.4',
      sim: 'signal-viewer',
    },
  ],
};
