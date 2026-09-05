import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Loader2, Check, X } from "lucide-react";
import Topbar from "../../components/Topbar";
import Button from "../../components/Button";
import { api } from "../../api/client";

export default function LabApprovals() {
  const { user } = useOutletContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    api.listRequests("pending").then(setRequests).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const decide = async (id, action) => {
    setBusyId(id);
    setError(null);
    try {
      if (action === "approve") await api.approveRequest(id);
      else await api.rejectRequest(id, "Not approved by lab assistant.");
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Topbar title="Pending approvals" subtitle="Requests for components in the lab(s) you administer" user={user} />
      <div className="px-8 py-7 max-w-5xl">
        {error && <p className="text-power-red text-sm font-body mb-4">{error}</p>}
        {loading ? (
          <Loader2 className="animate-spin text-power-red" size={22} />
        ) : requests.length === 0 ? (
          <p className="text-sm font-body text-slate bg-paper rounded-card shadow-card px-5 py-6">
            No pending requests for your lab right now.
          </p>
        ) : (
          <div className="bg-paper rounded-card shadow-card divide-y divide-ink/5">
            {requests.map((r) => (
              <div key={r.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-body font-medium text-ink">
                    {r.student_name} <span className="text-slate font-normal">· {r.student_somaiya_id}</span>
                  </p>
                  <p className="text-xs font-body text-slate mt-0.5">
                    {r.component_name} × {r.qty} — {r.room_name} {r.purpose && `· ${r.purpose}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={busyId === r.id} onClick={() => decide(r.id, "reject")}>
                    <X size={14} /> Decline
                  </Button>
                  <Button variant="primary" size="sm" disabled={busyId === r.id} onClick={() => decide(r.id, "approve")}>
                    {busyId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs font-body text-slate/70 mt-6">
          Approving locks the requested units against this student — they're removed from general availability
          until collected at the kiosk.
        </p>
      </div>
    </>
  );
}
