"use client";

interface TimeSelectorProps {
  value: Date;
  onChange: (date: Date) => void;
}

/**
 * Datetime picker with a "Now" reset button.
 * Emits a Date object on every change.
 */
export default function TimeSelector({ value, onChange }: TimeSelectorProps) {
  // Convert Date to the local ISO string format required by datetime-local input
  function toInputValue(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
      `T${pad(date.getHours())}:${pad(date.getMinutes())}`
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      onChange(date);
    }
  }

  function handleNow() {
    onChange(new Date());
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="datetime-local"
        value={toInputValue(value)}
        onChange={handleChange}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
      <button
        onClick={handleNow}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        Maintenant
      </button>
    </div>
  );
}
