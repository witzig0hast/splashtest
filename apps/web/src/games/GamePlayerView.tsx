import QuizPlayer from './quiz/Player';
import SketchPlayer from './sketch/Player';
import WyrPlayer from './wyr/Player';
import MostLikelyPlayer from './mostlikely/Player';
import QuiplashPlayer from './quiplash/Player';
import ImpostorPlayer from './impostor/Player';
import ReactionPlayer from './reaction/Player';
import EmojiPlayer from './emoji/Player';
import BlurtPlayer from './blurt/Player';
import DarePlayer from './dare/Player';

export default function GamePlayerView({ gameId, view }: { gameId: string; view: unknown }) {
  if (!view) {
    return (
      <div className="center-col">
        <span className="big-emoji pulse">🎮</span>
        <p className="muted">Spiel wird geladen …</p>
      </div>
    );
  }
  switch (gameId) {
    case 'quiz':
      return <QuizPlayer view={view as any} />;
    case 'sketch':
      return <SketchPlayer view={view as any} />;
    case 'wyr':
      return <WyrPlayer view={view as any} />;
    case 'mostlikely':
      return <MostLikelyPlayer view={view as any} />;
    case 'quiplash':
      return <QuiplashPlayer view={view as any} />;
    case 'impostor':
      return <ImpostorPlayer view={view as any} />;
    case 'reaction':
      return <ReactionPlayer view={view as any} />;
    case 'emoji':
      return <EmojiPlayer view={view as any} />;
    case 'blurt':
      return <BlurtPlayer view={view as any} />;
    case 'dare':
      return <DarePlayer view={view as any} />;
    default:
      return <p className="muted">Unbekanntes Spiel.</p>;
  }
}
