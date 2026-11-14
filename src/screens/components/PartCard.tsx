// Owner: B. Selectable component card.
export function PartCard({ name }: { name: string }) {
  return (
    <div className="border border-teal-500/30 bg-slate-900/60 p-4 rounded hover:border-teal-400">
      <h3 className="font-semibold text-teal-300">{name}</h3>
    </div>
  )
}
