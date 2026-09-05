import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Topbar from "../../components/Topbar";
import StatusPill from "../../components/StatusPill";
import { api } from "../../api/client";

export default function LabInventory() {
  const { user } = useOutletContext();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listComponents().then(setComponents).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar title="Inventory" subtitle="Stock levels for the lab(s) you administer" user={user} />
      <div className="px-8 py-7 max-w-5xl">
        {loading ? (
          <Loader2 className="animate-spin text-power-red" size={22} />
        ) : (
          <div className="bg-paper rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-left text-slate text-xs uppercase tracking-wide border-b border-ink/5">
                  <th className="px-5 py-3 font-medium">Component</th>
                  <th className="px-5 py-3 font-medium">Room</th>
                  <th className="px-5 py-3 font-medium">Available</th>
                  <th className="px-5 py-3 font-medium">Locked (reserved)</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {components.map((item) => {
                  const lowStock = item.total_qty > 0 && item.available_qty / item.total_qty < 0.25;
                  const pct = Math.round((item.available_qty / item.total_qty) * 100);
                  return (
                    <tr key={item.id} className="border-b border-ink/5 last:border-0">
                      <td className="px-5 py-3.5 text-ink font-medium">{item.name}</td>
                      <td className="px-5 py-3.5 text-slate">{item.room_name}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 w-40">
                          <div className="flex-1 h-1.5 rounded-full bg-ink/10 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: lowStock ? "#ED1C24" : "#004A9C" }} />
                          </div>
                          <span className="text-xs text-slate whitespace-nowrap">{item.available_qty}/{item.total_qty}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate">{item.reserved_qty}</td>
                      <td className="px-5 py-3.5"><StatusPill status={lowStock ? "lowstock" : "ok"} /></td>
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
