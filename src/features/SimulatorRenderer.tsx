import React, { Suspense } from 'react';
import type { SimId } from '../content/types';

// Route-level & component-level code splitting with React.lazy
const TopologyExplorer = React.lazy(() =>
  import('./unit1/TopologyExplorer').then((m) => ({ default: m.TopologyExplorer }))
);
const SignalViewer = React.lazy(() =>
  import('./unit1/SignalViewer').then((m) => ({ default: m.SignalViewer }))
);
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

interface SimulatorRendererProps {
  simId: SimId;
}

export function SimulatorRenderer({ simId }: SimulatorRendererProps) {
  let simComponent: React.ReactNode = null;

  switch (simId) {
    case 'topology-explorer':
      simComponent = <TopologyExplorer />;
      break;
    case 'signal-viewer':
      simComponent = <SignalViewer />;
      break;
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
    default:
      simComponent = (
        <div style={{ padding: 'var(--sp-6)', textAlign: 'center', color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          Simulator for <code>{simId}</code> will be loaded in the next step.
        </div>
      );
  }

  return (
    <Suspense
      fallback={
        <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
          Loading interactive simulator...
        </div>
      }
    >
      {simComponent}
    </Suspense>
  );
}
