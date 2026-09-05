import { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { ClipboardCheck, Users, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import Topbar from "../../components/Topbar";
import StatCard from "../../components/StatCard";
import StatusPill from "../../components/StatusPill";
import { api } from "../../api/client";

export default function ProfessorOverview() {
  const { user } = useOutletContext();
  const [requests, setRequests] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listRequests("pending"), api.usageReport()])
      .then(([reqs, u]) => {
        setRequests(reqs);
        setUsage(u);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar title="Lab oversight" subtitle={`${user.department} · Read-only view across all labs`} user={user} />

      <div className="px-8 py-7 max-w-6xl">
        {loading ? (
          <Loader2 className="animate-spin text-power-red" size={24} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard icon={ClipboardCheck} label="Pending approvals" value={requests.length} accent="blue" sub="Awaiting the lab assistant" />
              <StatCard icon={Users} label="Active students" value={usage?.active_students ?? "—"} accent="blue" sub="Currently holding items" />
              <StatCard icon={AlertTriangle} label="Overdue returns" value={usage?.overdue_count ?? "—"} accent="red" sub="Across all labs" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-ink">Pending requests</h2>
              <Link to="/professor/requests" className="text-sm font-body text-trust-blue hover:text-link-blue font-medium flex items-center gap-1">
                View all requests <ArrowRight size={14} />
              </Link>
            </div>
            <div className="bg-paper rounded-card shadow-card divide-y divide-ink/5">
              {requests.length === 0 ? (
                <p className="text-sm font-body text-slate px-5 py-6">No pending requests right now.</p>
              ) : (
                requests.map((r) => (
                  <div key={r.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-body font-medium text-ink">
                        {r.student_name} <span className="text-slate font-normal">· {r.student_somaiya_id}</span>
                      </p>
                      <p className="text-xs font-body text-slate mt-0.5">
                        {r.component_name} × {r.qty} — {r.room_name} {r.purpose && `· ${r.purpose}`}
                      </p>
                    </div>
                    <StatusPill status="issued">Awaiting lab assistant</StatusPill>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs font-body text-slate/70 mt-6">
              Professors have read-only visibility into requests. Approvals are handled by the lab assistant
              responsible for the room the component belongs to.
            </p>
          </>
        )}
      </div>
    </>
  );
}
