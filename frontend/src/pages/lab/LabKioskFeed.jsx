import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ScanLine, Loader2 } from "lucide-react";
import Topbar from "../../components/Topbar";
import StatusPill from "../../components/StatusPill";
import { api } from "../../api/client";

export default function LabKioskFeed() {
  const { user } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.kioskEvents().then(setEvents).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar title="Live kiosk feed" subtitle="Verification log for the lab(s) you administer" user={user} />
      <div className="px-8 py-7 max-w-6xl">
        <div className="flex items-center gap-2 mb-4">
          <ScanLine size={18} className="text-power-red" />
          <p className="text-sm font-body text-slate">
            Each row is one NFC tap + camera scan attempt at the kiosk, matched against approved (locked) requests.
          </p>
        </div>

        {loading ? (
          <Loader2 className="animate-spin text-power-red" size={22} />
        ) : (
          <div className="bg-paper rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-left text-slate text-xs uppercase tracking-wide border-b border-ink/5">
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Room</th>
                  <th className="px-5 py-3 font-medium">Detected</th>
                  <th className="px-5 py-3 font-medium">Result</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => {
                  let items = [];
                  try { items = JSON.parse(e.detected_items).map((d) => d.label).join(", "); } catch { items = "—"; }
                  return (
                    <tr key={e.id} className="border-b border-ink/5 last:border-0">
                      <td className="px-5 py-3.5 text-slate">{new Date(e.created_at).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-ink font-medium">{e.student_name}</td>
                      <td className="px-5 py-3.5 text-slate">{e.room_name}</td>
                      <td className="px-5 py-3.5 text-slate">{items}</td>
                      <td className="px-5 py-3.5">
                        <StatusPill status={e.match_status === "match" ? "match" : "mismatch"}>
                          {e.match_status.replace(/_/g, " ")}
                        </StatusPill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
