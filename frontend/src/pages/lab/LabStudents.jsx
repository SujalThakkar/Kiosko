import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Topbar from "../../components/Topbar";
import StatusPill from "../../components/StatusPill";
import Button from "../../components/Button";
import { api } from "../../api/client";

export default function LabStudents() {
  const { user } = useOutletContext();
  const [issuances, setIssuances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    api.listIssuances().then(setIssuances).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const overdue = issuances.filter((i) => i.status === "overdue");
  const active = issuances.filter((i) => i.status !== "returned");

  const handleReturn = async (id) => {
    setBusyId(id);
    try {
      await api.returnIssuance(id);
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Topbar title="Student records" subtitle="Active loans for the lab(s) you administer" user={user} />
      <div className="px-8 py-7 max-w-5xl">
        {loading ? (
          <Loader2 className="animate-spin text-power-red" size={22} />
        ) : (
          <>
            <h2 className="font-display text-lg text-ink mb-3">Overdue</h2>
            <div className="bg-paper rounded-card shadow-card divide-y divide-ink/5 mb-8">
              {overdue.length === 0 ? (
                <p className="text-sm font-body text-slate px-5 py-6">Nothing overdue.</p>
              ) : (
                overdue.map((i) => (
                  <div key={i.id} className="px-5 py-3.5 flex items-center justify-between text-sm font-body">
                    <div>
                      <span className="text-ink font-medium">{i.student_name}</span>
                      <span className="text-slate"> — {i.component_name} × {i.qty}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill status="overdue">Due {new Date(i.due_at).toLocaleDateString()}</StatusPill>
                      <Button variant="outline" size="sm" disabled={busyId === i.id} onClick={() => handleReturn(i.id)}>
                        Mark returned
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <h2 className="font-display text-lg text-ink mb-3">All active loans</h2>
            <div className="bg-paper rounded-card shadow-card overflow-hidden">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="text-left text-slate text-xs uppercase tracking-wide border-b border-ink/5">
                    <th className="px-5 py-3 font-medium">Student</th>
                    <th className="px-5 py-3 font-medium">Component</th>
                    <th className="px-5 py-3 font-medium">Issued</th>
                    <th className="px-5 py-3 font-medium">Due</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {active.map((i) => (
                    <tr key={i.id} className="border-b border-ink/5 last:border-0">
                      <td className="px-5 py-3.5 text-ink font-medium">{i.student_name}</td>
                      <td className="px-5 py-3.5 text-slate">{i.component_name} × {i.qty}</td>
                      <td className="px-5 py-3.5 text-slate">{new Date(i.issued_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-slate">{i.due_at ? new Date(i.due_at).toLocaleDateString() : "—"}</td>
                      <td className="px-5 py-3.5"><StatusPill status={i.status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <Button variant="ghost" size="sm" disabled={busyId === i.id} onClick={() => handleReturn(i.id)}>
                          Mark returned
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
