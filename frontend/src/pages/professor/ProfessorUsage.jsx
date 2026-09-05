import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Package, Users, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import Topbar from "../../components/Topbar";
import StatCard from "../../components/StatCard";
import { api } from "../../api/client";

export default function ProfessorUsage() {
  const { user } = useOutletContext();
  const [usage, setUsage] = useState(null);
  const [issuances, setIssuances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.usageReport(), api.listIssuances()])
      .then(([u, iss]) => {
        setUsage(u);
        setIssuances(iss);
      })
      .finally(() => setLoading(false));
  }, []);

  const overdue = issuances.filter((i) => i.status === "overdue");

  return (
    <>
      <Topbar title="Lab usage reports" subtitle="Aggregate issuance activity across every lab" user={user} />
      <div className="px-8 py-7 max-w-6xl">
        {loading ? (
          <Loader2 className="animate-spin text-trust-blue" size={24} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Package} label="Issued this week" value={usage.total_issued_this_week} accent="blue" />
              <StatCard icon={Users} label="Active students" value={usage.active_students} accent="blue" />
              <StatCard icon={AlertTriangle} label="Overdue items" value={usage.overdue_count} accent="red" />
              <StatCard icon={TrendingUp} label="Most issued" value={usage.most_issued_item || "—"} accent="red" sub="This week" />
            </div>

            <h2 className="font-display text-xl text-ink mb-4">Overdue items</h2>
            <div className="bg-paper rounded-card shadow-card divide-y divide-ink/5">
              {overdue.length === 0 ? (
                <p className="text-sm font-body text-slate px-5 py-6">Nothing overdue right now.</p>
              ) : (
                overdue.map((i) => (
                  <div key={i.id} className="px-5 py-3.5 flex items-center justify-between text-sm font-body">
                    <div>
                      <span className="text-ink font-medium">{i.student_name}</span>
                      <span className="text-slate"> — {i.component_name} × {i.qty}</span>
                    </div>
                    <span className="text-power-red text-xs font-medium">
                      Due {new Date(i.due_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
