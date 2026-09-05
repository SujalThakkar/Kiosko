import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ScanLine, Plus, X, Loader2 } from "lucide-react";
import Topbar from "../../components/Topbar";
import Button from "../../components/Button";
import ScanFrame from "../../components/ScanFrame";
import { api } from "../../api/client";

export default function StudentRequest() {
  const { user } = useOutletContext();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [components, setComponents] = useState([]);
  const [cart, setCart] = useState([]);
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listRooms().then((rms) => {
      setRooms(rms);
      if (rms.length) setSelectedRoom(rms[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedRoom == null) return;
    api.listComponents(selectedRoom).then(setComponents).catch((e) => setError(e.message));
  }, [selectedRoom]);

  const addItem = (item) => {
    if (cart.find((c) => c.id === item.id)) return;
    setCart([...cart, { ...item, requestQty: 1 }]);
  };
  const removeItem = (id) => setCart(cart.filter((c) => c.id !== id));

  const submitAll = async () => {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      for (const item of cart) {
        await api.createRequest(item.id, item.requestQty, purpose || undefined);
      }
      setResult(`Sent ${cart.length} request(s) to the lab assistant for approval.`);
      setCart([]);
      if (selectedRoom != null) api.listComponents(selectedRoom).then(setComponents);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar title="Request a component" subtitle="Select items — your lab assistant approves before you can collect at the kiosk" user={user} />

      <div className="px-8 py-7 max-w-6xl">
        {rooms.length > 0 && (
          <div className="flex gap-2 mb-6">
            {rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRoom(r.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-body font-medium border transition-colors ${
                  selectedRoom === r.id
                    ? "border-power-red bg-power-red/[0.08] text-power-red"
                    : "border-ink/15 text-slate hover:border-ink/30"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="font-display text-lg text-ink mb-3">Available components</h2>
            {loading ? (
              <Loader2 className="animate-spin text-power-red" size={22} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {components.map((item) => (
                  <div key={item.id} className="bg-paper rounded-card shadow-card p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-body font-medium text-ink">{item.name}</p>
                      <p className="text-xs font-body text-slate mt-0.5">
                        {item.category} · {item.available_qty} available
                        {item.reserved_qty > 0 && ` · ${item.reserved_qty} locked for other approvals`}
                      </p>
                    </div>
                    <button
                      onClick={() => addItem(item)}
                      disabled={item.available_qty === 0}
                      className="w-8 h-8 rounded-full bg-power-red/10 text-power-red flex items-center justify-center hover:bg-power-red hover:text-white transition-colors disabled:opacity-30"
                      aria-label={`Add ${item.name}`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-display text-lg text-ink mb-3">Your request</h2>
            <div className="bg-paper rounded-card shadow-card p-4">
              {cart.length === 0 ? (
                <p className="text-sm font-body text-slate py-6 text-center">No components selected yet.</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm font-body">
                      <span className="text-ink">{item.name}</span>
                      <button onClick={() => removeItem(item.id)} className="text-slate hover:text-power-red">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Purpose (e.g. IoT Mini Project)"
                className="w-full px-3 py-2 mb-3 rounded-md border border-ink/15 text-sm font-body focus:border-power-red focus:ring-1 focus:ring-power-red outline-none"
              />

              <Button
                variant="primary"
                className="w-full"
                disabled={cart.length === 0 || submitting}
                onClick={submitAll}
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Send for approval"}
              </Button>
            </div>

            {error && (
              <p className="mt-3 text-xs font-body text-power-red bg-power-red/[0.06] border border-power-red/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {result && (
              <ScanFrame active className="mt-5 bg-power-red/[0.04] border border-power-red/30 rounded-card p-5 text-center">
                <ScanLine size={22} className="text-power-red mx-auto mb-2" />
                <p className="text-sm font-body text-ink font-medium mb-1">{result}</p>
                <p className="text-xs font-body text-slate">
                  Once your lab assistant approves, those units are locked for you — tap your ID at the kiosk and
                  place them in the scan area to complete issuance.
                </p>
              </ScanFrame>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
