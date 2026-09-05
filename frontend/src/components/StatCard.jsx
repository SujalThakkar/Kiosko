export default function StatCard({ icon: Icon, label, value, accent = "red", sub }) {
  const accentColor = accent === "blue" ? "#004A9C" : "#B7202E";
  return (
    <div className="bg-paper rounded-card shadow-card p-5 flex items-start justify-between">
      <div>
        <p className="text-slate text-xs font-body uppercase tracking-wide mb-2">{label}</p>
        <p className="font-display text-3xl text-ink leading-none">{value}</p>
        {sub && <p className="text-slate text-xs font-body mt-2">{sub}</p>}
      </div>
      {Icon && (
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}12` }}
        >
          <Icon size={18} color={accentColor} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
