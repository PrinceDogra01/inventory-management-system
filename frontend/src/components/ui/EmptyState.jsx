export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-600" />
      </div>
      <h3 className="text-slate-300 font-medium mb-1">{title}</h3>
      <p className="text-slate-500 text-sm mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  )
}
