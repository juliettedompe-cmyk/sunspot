"use client";

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

/**
 * Time-of-day slider: scrubs hours 00:00–23:45 in 15-minute steps.
 * The date part (year/month/day) of `value` is preserved on change.
 */
export default function TimeSlider({ value, onChange }: Props) {
  const totalMinutes = value.getHours() * 60 + value.getMinutes();

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const m = Number(e.target.value);
    const next = new Date(value);
    next.setHours(Math.floor(m / 60), m % 60, 0, 0);
    onChange(next);
  }

  function handleNow() {
    onChange(new Date());
  }

  const timeLabel = value.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-2">
      <span className="w-10 flex-shrink-0 text-right text-xs font-semibold tabular-nums text-amber-700">
        {timeLabel}
      </span>

      <input
        type="range"
        min={0}
        max={1439}
        step={15}
        value={totalMinutes}
        onChange={handleSliderChange}
        aria-label="Heure"
        aria-valuetext={timeLabel}
        className="h-1.5 flex-1 cursor-pointer accent-amber-500"
      />

      <button
        onClick={handleNow}
        className="flex-shrink-0 text-xs text-gray-400 hover:text-amber-600 transition-colors"
      >
        Maintenant
      </button>
    </div>
  );
}
