import type { Player } from '@splash/shared';
import QuizHost from './quiz/Host';
import SketchHost from './sketch/Host';
import WyrHost from './wyr/Host';
import MostLikelyHost from './mostlikely/Host';
import QuiplashHost from './quiplash/Host';
import ImpostorHost from './impostor/Host';
import ReactionHost from './reaction/Host';
import EmojiHost from './emoji/Host';
import BlurtHost from './blurt/Host';
import DareHost from './dare/Host';

export default function GameHostView({
  gameId,
  view,
}: {
  gameId: string;
  gameName: string | null;
  view: unknown;
  players: Player[];
}) {
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
      return <QuizHost view={view as any} />;
    case 'sketch':
      return <SketchHost view={view as any} />;
    case 'wyr':
      return <WyrHost view={view as any} />;
    case 'mostlikely':
      return <MostLikelyHost view={view as any} />;
    case 'quiplash':
      return <QuiplashHost view={view as any} />;
    case 'impostor':
      return <ImpostorHost view={view as any} />;
    case 'reaction':
      return <ReactionHost view={view as any} />;
    case 'emoji':
      return <EmojiHost view={view as any} />;
    case 'blurt':
      return <BlurtHost view={view as any} />;
    case 'dare':
      return <DareHost view={view as any} />;
    default:
      return <p className="muted">Unbekanntes Spiel.</p>;
  }
}
