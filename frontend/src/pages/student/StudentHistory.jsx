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

export default function StudentHistory() {
  const { user } = useOutletContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listRequests().then(setRequests).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar title="Issue history" subtitle="Every request you've made, and its current status" user={user} />
      <div className="px-8 py-7 max-w-5xl">
        {loading ? (
          <Loader2 className="animate-spin text-power-red" size={22} />
        ) : (
          <div className="bg-paper rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-left text-slate text-xs uppercase tracking-wide border-b border-ink/5">
                  <th className="px-5 py-3 font-medium">Requested on</th>
                  <th className="px-5 py-3 font-medium">Component</th>
                  <th className="px-5 py-3 font-medium">Room</th>
                  <th className="px-5 py-3 font-medium">Purpose</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-5 py-3.5 text-slate">{new Date(r.requested_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-ink font-medium">{r.component_name} × {r.qty}</td>
                    <td className="px-5 py-3.5 text-slate">{r.room_name}</td>
                    <td className="px-5 py-3.5 text-slate">{r.purpose || "—"}</td>
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
