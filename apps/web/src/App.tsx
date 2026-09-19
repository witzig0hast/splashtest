import { RouterProvider, useRouter } from './lib/router';
import HomeScreen from './screens/HomeScreen';
import HostScreen from './screens/HostScreen';
import PlayerScreen from './screens/PlayerScreen';

function Routes() {
  const { path } = useRouter();
  if (path.startsWith('/host')) return <HostScreen />;
  if (path.startsWith('/play')) return <PlayerScreen />;
  return <HomeScreen />;
}

export default function App() {
  return (
    <RouterProvider>
      <div className="app-shell">
        <Routes />
      </div>
    </RouterProvider>
  );
}
