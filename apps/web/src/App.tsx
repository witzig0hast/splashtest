import type { CSSProperties } from 'react';
import { getGameMeta } from '@splash/shared';
import { RouterProvider, useRouter } from './lib/router';
import { useStore } from './state/store';
import HomeScreen from './screens/HomeScreen';
import HostScreen from './screens/HostScreen';
import PlayerScreen from './screens/PlayerScreen';

const DEFAULT_STAGE = '#5b6cf9';

function Routes() {
  const { path } = useRouter();
  if (path.startsWith('/host')) return <HostScreen />;
  if (path.startsWith('/play')) return <PlayerScreen />;
  return <HomeScreen />;
}

export default function App() {
  const gameId = useStore((s) => s.gameId);
  const stage = (gameId && getGameMeta(gameId)?.color) || DEFAULT_STAGE;

  return (
    <RouterProvider>
      <div className="app-shell" style={{ '--stage': stage } as CSSProperties}>
        <Routes />
      </div>
    </RouterProvider>
  );
}
