const STYLES = {
  issued: { bg: "#004A9C14", fg: "#004A9C", label: "Issued" },
  returned: { bg: "#58595B14", fg: "#58595B", label: "Returned" },
  overdue: { bg: "#B7202E14", fg: "#B7202E", label: "Overdue" },
  match: { bg: "#0A7A3714", fg: "#0A7A37", label: "Verified match" },
  mismatch: { bg: "#ED1C2414", fg: "#ED1C24", label: "Mismatch flagged" },
  lowstock: { bg: "#ED1C2414", fg: "#ED1C24", label: "Low stock" },
  ok: { bg: "#0A7A3714", fg: "#0A7A37", label: "In stock" },
};

export default function StatusPill({ status, children }) {
  const s = STYLES[status] || STYLES.issued;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-body whitespace-nowrap"
      style={{ background: s.bg, color: s.fg }}
    >
      {children || s.label}
    </span>
  );
}
