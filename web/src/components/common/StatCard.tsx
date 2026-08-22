export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900/60 px-5 py-3.5">
      <p className="font-score text-3xl font-bold leading-none text-paper sm:text-4xl">{value}</p>
      <p className="mt-1.5 text-xs uppercase tracking-wide text-ink-300">{label}</p>
    </div>
  )
}
