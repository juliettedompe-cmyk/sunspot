interface Props {
  loading: boolean;
  error: string | null;
  totalCount: number;
  sunnyCount: number;
}

export default function StatusBar({ loading, error, totalCount, sunnyCount }: Props) {
  if (loading) {
    return (
      <div className="rounded-lg bg-white/90 px-3 py-2 text-sm text-gray-500 shadow backdrop-blur-sm">
        Chargement…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 shadow">
        {error}
      </div>
    );
  }

  if (totalCount === 0) return null;

  return (
    <div className="rounded-lg bg-white/90 px-3 py-2 text-sm shadow backdrop-blur-sm">
      <span className="font-medium text-amber-600">
        {sunnyCount} ensoleillée{sunnyCount !== 1 ? "s" : ""}
      </span>
      <span className="text-gray-400"> / {totalCount} terrasses</span>
    </div>
  );
}
