import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Topbar from "../../components/Topbar";
import StatusPill from "../../components/StatusPill";
import { api } from "../../api/client";

const STATUS_MAP = {
  pending: "issued",
  approved: "match",
  fulfilled: "match",
  rejected: "overdue",
  cancelled: "overdue",
};

const FILTERS = ["all", "pending", "approved", "fulfilled", "rejected"];

export default function ProfessorRequests() {
  const { user } = useOutletContext();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listRequests(filter === "all" ? undefined : filter)
      .then(setRequests)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <>
      <Topbar title="All requests" subtitle="Read-only — approvals happen at the lab-assistant level, per room" user={user} />
      <div className="px-8 py-7 max-w-6xl">
        <div className="flex gap-2 mb-5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-body font-medium border capitalize transition-colors ${
                filter === f
                  ? "border-trust-blue bg-trust-blue/[0.08] text-trust-blue"
                  : "border-ink/15 text-slate hover:border-ink/30"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader2 className="animate-spin text-trust-blue" size={22} />
        ) : (
          <div className="bg-paper rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-left text-slate text-xs uppercase tracking-wide border-b border-ink/5">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Component</th>
                  <th className="px-5 py-3 font-medium">Room</th>
                  <th className="px-5 py-3 font-medium">Requested</th>
                  <th className="px-5 py-3 font-medium">Decided by</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-5 py-3.5">
                      <p className="text-ink font-medium">{r.student_name}</p>
                      <p className="text-xs text-slate">{r.student_somaiya_id}</p>
                    </td>
                    <td className="px-5 py-3.5 text-ink">{r.component_name} × {r.qty}</td>
                    <td className="px-5 py-3.5 text-slate">{r.room_name}</td>
                    <td className="px-5 py-3.5 text-slate">{new Date(r.requested_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-slate">{r.decided_by_name || "—"}</td>
                    <td className="px-5 py-3.5"><StatusPill status={STATUS_MAP[r.status] || "issued"}>{r.status}</StatusPill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
