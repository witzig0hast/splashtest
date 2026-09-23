interface GenreOption {
  id: string;
  label: string;
}

export default function GenrePicker({
  gameName,
  genres,
  loading,
  onSelect,
  onCancel,
}: {
  gameName: string;
  genres: GenreOption[] | null;
  loading: boolean;
  onSelect: (genreId: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="card stack" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h3 style={{ textAlign: 'center' }}>{gameName}: Stil wählen</h3>
      {loading || !genres ? (
        <p className="muted" style={{ textAlign: 'center' }}>
          Lädt …
        </p>
      ) : (
        <div className="stack-sm">
          {genres.map((g) => (
            <button key={g.id} className="btn btn-secondary btn-block" onClick={() => onSelect(g.id)}>
              {g.label}
            </button>
          ))}
        </div>
      )}
      <button className="btn btn-ghost" onClick={onCancel}>
        Abbrechen
      </button>
    </div>
  );
}
