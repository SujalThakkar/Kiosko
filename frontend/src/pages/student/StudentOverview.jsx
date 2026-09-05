import { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { PackageCheck, AlertTriangle, History as HistoryIcon, ArrowRight, Loader2 } from "lucide-react";
import Topbar from "../../components/Topbar";
import StatCard from "../../components/StatCard";
import StatusPill from "../../components/StatusPill";
import Button from "../../components/Button";
import { api } from "../../api/client";

export default function StudentOverview() {
  const { user } = useOutletContext();
  const [issuances, setIssuances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.listIssuances(), api.listRequests()])
      .then(([iss, reqs]) => {
        setIssuances(iss);
        setRequests(reqs);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const active = issuances.filter((i) => i.status !== "returned");
  const overdue = issuances.filter((i) => i.status === "overdue");

  return (
    <>
      <Topbar title={`Welcome back, ${user.name.split(" ")[0]}`} subtitle={user.department} user={user} />

      <div className="px-8 py-7 max-w-6xl">
        {error && <p className="text-power-red text-sm font-body mb-4">{error}</p>}
        {loading ? (
          <Loader2 className="animate-spin text-power-red" size={24} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard icon={PackageCheck} label="Currently issued" value={active.length} accent="red" sub="Items on loan" />
              <StatCard icon={AlertTriangle} label="Overdue" value={overdue.length} accent="red" sub={overdue.length ? "Return as soon as possible" : "All clear"} />
              <StatCard icon={HistoryIcon} label="Total requests" value={requests.length} accent="blue" sub="This account" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-ink">Currently issued items</h2>
              <Link to="/student/request">
                <Button variant="primary" size="sm">
                  Request a component <ArrowRight size={14} />
                </Button>
              </Link>
            </div>

            <div className="bg-paper rounded-card shadow-card overflow-hidden mb-8">
              {active.length === 0 ? (
                <p className="text-sm font-body text-slate px-5 py-6">Nothing currently issued to you.</p>
              ) : (
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="text-left text-slate text-xs uppercase tracking-wide border-b border-ink/5">
                      <th className="px-5 py-3 font-medium">Component</th>
                      <th className="px-5 py-3 font-medium">Qty</th>
                      <th className="px-5 py-3 font-medium">Issued on</th>
                      <th className="px-5 py-3 font-medium">Due on</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.map((item) => (
                      <tr key={item.id} className="border-b border-ink/5 last:border-0">
                        <td className="px-5 py-3.5 text-ink font-medium">{item.component_name}</td>
                        <td className="px-5 py-3.5 text-slate">{item.qty}</td>
                        <td className="px-5 py-3.5 text-slate">{new Date(item.issued_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5 text-slate">{item.due_at ? new Date(item.due_at).toLocaleDateString() : "—"}</td>
                        <td className="px-5 py-3.5"><StatusPill status={item.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-ink">Recent requests</h2>
              <Link to="/student/history" className="text-sm font-body text-power-red hover:text-vitality-red font-medium">
                View full history →
              </Link>
            </div>
            <div className="bg-paper rounded-card shadow-card divide-y divide-ink/5">
              {requests.slice(0, 4).map((r) => (
                <div key={r.id} className="px-5 py-3.5 flex items-center justify-between text-sm font-body">
                  <div>
                    <span className="text-ink font-medium">{r.component_name}</span>
                    <span className="text-slate"> × {r.qty} — {r.room_name}</span>
                  </div>
                  <StatusPill status={r.status === "pending" ? "issued" : r.status === "rejected" ? "overdue" : r.status === "fulfilled" ? "match" : "issued"}>
                    {r.status}
                  </StatusPill>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
