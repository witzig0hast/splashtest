import type { CSSProperties } from 'react';
import { getGameMeta } from '@splash/shared';
import { RouterProvider, useRouter } from './lib/router';
import { useStore } from './state/store';
import { cardGradientStops } from './lib/color';
import HomeScreen from './screens/HomeScreen';
import HostScreen from './screens/HostScreen';
import PlayerScreen from './screens/PlayerScreen';

const DEFAULT_STAGE = '#00c2b2';

function Routes() {
  const { path } = useRouter();
  if (path.startsWith('/host')) return <HostScreen />;
  if (path.startsWith('/play')) return <PlayerScreen />;
  return <HomeScreen />;
}

export default function App() {
  const gameId = useStore((s) => s.gameId);
  const stage = (gameId && getGameMeta(gameId)?.color) || DEFAULT_STAGE;
  const { a, b } = cardGradientStops(stage);

  return (
    <RouterProvider>
      <div className="app-shell" style={{ '--stage': stage, '--card-a': a, '--card-b': b } as CSSProperties}>
        <Routes />
      </div>
    </RouterProvider>
  );
}
