interface Props {
  loading: boolean;
  error: string | null;
  totalCount: number;
  sunnyCount: number;
  partialCount: number;
}

export default function StatusBar({
  loading,
  error,
  totalCount,
  sunnyCount,
  partialCount,
}: Props) {
  if (loading) {
    return <p className="text-xs text-gray-400">Chargement…</p>;
  }

  if (error) {
    return <p className="text-xs text-red-500">{error}</p>;
  }

  if (totalCount === 0) return null;

  return (
    <p className="text-xs text-gray-500">
      <span className="font-semibold text-amber-600">☀️ {sunnyCount}</span>
      {partialCount > 0 && (
        <span className="font-semibold text-orange-500"> · 🌤 {partialCount}</span>
      )}
      <span> / {totalCount} terrasses</span>
    </p>
  );
}
