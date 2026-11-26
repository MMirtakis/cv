import { centsToEuro } from "@/lib/format";

export function Stat({
  label,
  cents,
  tone = "neutral",
  hint,
}: {
  label: string;
  cents: number;
  tone?: "neutral" | "good" | "bad" | "warn";
  hint?: string;
}) {
  return (
    <div className={`stat tone-${tone}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{centsToEuro(cents)}</p>
      {hint ? <p className="stat-hint">{hint}</p> : null}
    </div>
  );
}
