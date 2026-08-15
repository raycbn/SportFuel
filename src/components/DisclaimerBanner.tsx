import { DISCLAIMER } from "@/features/nutrition-engine";

export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      className={`rounded-2xl border border-ember-400/30 bg-ember-400/10 text-ink-800 ${compact ? "px-4 py-3 text-xs" : "px-5 py-4 text-sm"}`}
      role="note"
    >
      <p className="font-semibold text-ink-900">Aviso</p>
      <p className="mt-1 leading-relaxed">{DISCLAIMER}</p>
    </aside>
  );
}
