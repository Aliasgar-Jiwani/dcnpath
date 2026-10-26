import React, { Suspense } from 'react';
import type { SimId } from '../content/types';

// Route-level & component-level code splitting with React.lazy
// Unit 1
const TopologyExplorer = React.lazy(() =>
  import('./unit1/TopologyExplorer').then((m) => ({ default: m.TopologyExplorer }))
);
const SignalViewer = React.lazy(() =>
  import('./unit1/SignalViewer').then((m) => ({ default: m.SignalViewer }))
);

// Unit 2
const LineCoding = React.lazy(() =>
  import('./unit2/LineCoding').then((m) => ({ default: m.LineCoding }))
);
const Modulation = React.lazy(() =>
  import('./unit2/Modulation').then((m) => ({ default: m.Modulation }))
);
const Sampling = React.lazy(() =>
  import('./unit2/Sampling').then((m) => ({ default: m.Sampling }))
);
const ChannelCapacity = React.lazy(() =>
  import('./unit2/ChannelCapacity').then((m) => ({ default: m.ChannelCapacity }))
);

// Unit 3
const MultiplexingSim = React.lazy(() =>
  import('./unit3/MultiplexingSim').then((m) => ({ default: m.MultiplexingSim }))
);
const ParityLrcSim = React.lazy(() =>
  import('./unit3/ParityLrcSim').then((m) => ({ default: m.ParityLrcSim }))
);
const CrcSim = React.lazy(() =>
  import('./unit3/CrcSim').then((m) => ({ default: m.CrcSim }))
);
const ChecksumSim = React.lazy(() =>
  import('./unit3/ChecksumSim').then((m) => ({ default: m.ChecksumSim }))
);
const HammingSim = React.lazy(() =>
  import('./unit3/HammingSim').then((m) => ({ default: m.HammingSim }))
);

// Unit 4
const ArqSim = React.lazy(() =>
  import('./unit4/ArqSim').then((m) => ({ default: m.ArqSim }))
);
const HdlcFramingSim = React.lazy(() =>
  import('./unit4/HdlcFramingSim').then((m) => ({ default: m.HdlcFramingSim }))
);

// Unit 5
const CsmaCdSim = React.lazy(() =>
  import('./unit5/CsmaCdSim').then((m) => ({ default: m.CsmaCdSim }))
);
const TokenRingSim = React.lazy(() =>
  import('./unit5/TokenRingSim').then((m) => ({ default: m.TokenRingSim }))
);
const SwitchingSim = React.lazy(() =>
  import('./unit5/SwitchingSim').then((m) => ({ default: m.SwitchingSim }))
);
const IsdnSim = React.lazy(() =>
  import('./unit5/IsdnSim').then((m) => ({ default: m.IsdnSim }))
);

interface SimulatorRendererProps {
  simId: SimId;
}

export function SimulatorRenderer({ simId }: SimulatorRendererProps) {
  let simComponent: React.ReactNode = null;

  switch (simId) {
    // Unit 1
    case 'topology-explorer':
      simComponent = <TopologyExplorer />;
      break;
    case 'signal-viewer':
      simComponent = <SignalViewer />;
      break;

    // Unit 2
    case 'line-coding':
      simComponent = <LineCoding />;
      break;
    case 'modulation':
      simComponent = <Modulation />;
      break;
    case 'sampling-pcm':
      simComponent = <Sampling />;
      break;
    case 'channel-capacity':
      simComponent = <ChannelCapacity />;
      break;

    // Unit 3
    case 'multiplexing':
      simComponent = <MultiplexingSim />;
      break;
    case 'parity-lrc':
      simComponent = <ParityLrcSim />;
      break;
    case 'crc-division':
      simComponent = <CrcSim />;
      break;
    case 'checksum':
      simComponent = <ChecksumSim />;
      break;
    case 'hamming':
      simComponent = <HammingSim />;
      break;

    // Unit 4
    case 'arq-simulator':
      simComponent = <ArqSim />;
      break;
    case 'hdlc-framing':
      simComponent = <HdlcFramingSim />;
      break;

    // Unit 5
    case 'csma-cd':
      simComponent = <CsmaCdSim />;
      break;
    case 'token-ring':
      simComponent = <TokenRingSim />;
      break;
    case 'switching-compare':
      simComponent = <SwitchingSim />;
      break;
    case 'isdn-channels':
      simComponent = <IsdnSim />;
      break;

    default:
      simComponent = (
        <div
          style={{
            padding: 'var(--sp-6)',
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          Simulator for <code>{simId}</code> is loading...
        </div>
      );
  }

  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: 'var(--sp-8)',
            textAlign: 'center',
            color: 'var(--color-text-tertiary)',
            fontStyle: 'italic',
          }}
        >
          Loading interactive simulator...
        </div>
      }
    >
      {simComponent}
    </Suspense>
  );
}
