const ROLE_ACCENT = {
  Student: { bg: "#B7202E14", fg: "#B7202E" },
  Professor: { bg: "#004A9C14", fg: "#004A9C" },
  "Lab Assistant": { bg: "#58595B18", fg: "#58595B" },
};

export default function Topbar({ title, subtitle, user }) {
  const accent = ROLE_ACCENT[user.role] || ROLE_ACCENT.Student;
  return (
    <header className="sticky top-0 z-10 bg-paper/90 backdrop-blur border-b border-ink/5 px-8 py-5 flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl text-ink">{title}</h1>
        {subtitle && <p className="text-slate text-sm font-body mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <span
          className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-body font-medium"
          style={{ background: accent.bg, color: accent.fg }}
        >
          {user.role}
        </span>
        <div className="text-right hidden md:block">
          <p className="text-sm font-body font-medium text-ink leading-tight">{user.name}</p>
          <p className="text-xs font-body text-slate leading-tight">{user.id}</p>
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-body text-sm font-semibold flex-shrink-0"
          style={{ background: accent.fg }}
        >
          {user.avatarInitials}
        </div>
      </div>
    </header>
  );
}
