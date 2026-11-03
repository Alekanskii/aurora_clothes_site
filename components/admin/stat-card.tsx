export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-6">
      <p className="text-xs uppercase tracking-wide text-stone">{label}</p>
      <p className="mt-2 font-heading text-2xl font-extrabold">{value}</p>
    </div>
  );
}
