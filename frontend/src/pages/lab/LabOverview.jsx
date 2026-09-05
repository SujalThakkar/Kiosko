import { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Package, AlertTriangle, ScanLine, Boxes, Loader2 } from "lucide-react";
import Topbar from "../../components/Topbar";
import StatCard from "../../components/StatCard";
import StatusPill from "../../components/StatusPill";
import ScanFrame from "../../components/ScanFrame";
import { api } from "../../api/client";

export default function LabOverview() {
  const { user } = useOutletContext();
  const [usage, setUsage] = useState(null);
  const [components, setComponents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.usageReport(), api.listComponents(), api.kioskEvents()])
      .then(([u, comps, evs]) => {
        setUsage(u);
        setComponents(comps);
        setEvents(evs);
      })
      .finally(() => setLoading(false));
  }, []);

  const lowStock = components.filter((c) => c.total_qty > 0 && c.available_qty / c.total_qty < 0.25);

  return (
    <>
      <Topbar title="Kiosk control center" subtitle={user.department} user={user} />
      <div className="px-8 py-7 max-w-6xl">
        {loading ? (
          <Loader2 className="animate-spin text-power-red" size={24} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard icon={Package} label="Issued this week" value={usage.total_issued_this_week} accent="red" />
              <StatCard icon={Boxes} label="Low stock items" value={lowStock.length} accent="red" sub="Reorder soon" />
              <StatCard icon={AlertTriangle} label="Overdue" value={usage.overdue_count} accent="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-lg text-ink flex items-center gap-2">
                    <ScanLine size={18} className="text-power-red" /> Live kiosk feed
                  </h2>
                  <Link to="/lab-assistant/kiosk" className="text-xs font-body text-power-red font-medium">View all →</Link>
                </div>
                <ScanFrame active className="bg-paper rounded-card shadow-card p-5">
                  <p className="text-xs font-body text-slate uppercase tracking-wide mb-3">Most recent scans</p>
                  <div className="space-y-2">
                    {events.slice(0, 4).map((e) => (
                      <div key={e.id} className="flex items-center justify-between text-sm font-body">
                        <span className="text-ink">{e.student_name}</span>
                        <StatusPill status={e.match_status === "match" ? "match" : "mismatch"} />
                      </div>
                    ))}
                  </div>
                </ScanFrame>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-lg text-ink">Low stock alerts</h2>
                  <Link to="/lab-assistant/inventory" className="text-xs font-body text-power-red font-medium">Manage inventory →</Link>
                </div>
                <div className="bg-paper rounded-card shadow-card divide-y divide-ink/5">
                  {lowStock.length === 0 ? (
                    <p className="text-sm font-body text-slate px-5 py-6">Everything is well stocked.</p>
                  ) : (
                    lowStock.map((item) => (
                      <div key={item.id} className="px-5 py-3.5 flex items-center justify-between text-sm font-body">
                        <div>
                          <p className="text-ink font-medium">{item.name}</p>
                          <p className="text-xs text-slate">{item.available_qty} of {item.total_qty} remaining</p>
                        </div>
                        <StatusPill status="lowstock" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
