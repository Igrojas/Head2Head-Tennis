export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-court-800 bg-court-900/60 px-5 py-4">
      <p className="font-display text-2xl font-semibold text-white sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-court-300">{label}</p>
    </div>
  )
}
