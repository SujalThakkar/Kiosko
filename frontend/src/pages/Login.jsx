import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Presentation, Wrench, ScanLine, ArrowRight, Loader2 } from "lucide-react";
import ScanFrame from "../components/ScanFrame";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { key: "student", label: "Student", icon: GraduationCap, path: "/student", desc: "Request & track lab components" },
  { key: "professor", label: "Professor", icon: Presentation, path: "/professor", desc: "View requests & lab usage reports (read-only)" },
  { key: "lab_assistant", label: "Lab Assistant", icon: Wrench, path: "/lab-assistant", desc: "Approve requests & manage inventory for your lab" },
];

const DEMO_IDS = {
  student: "KJ2024-EXTC-114",
  professor: "FAC-0231",
  lab_assistant: "LAB-0042",
};

export default function Login() {
  const [selected, setSelected] = useState("student");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const activeRole = ROLES.find((r) => r.key === selected);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      const user = await login(id.trim(), password);
      if (user.role !== selected) {
        setFormError(
          `This ID belongs to a ${user.roleLabel} account — switch role tabs above to match, or use the correct ID.`
        );
        return;
      }
      navigate(activeRole.path);
    } catch (err) {
      setFormError(err.message || "Sign in failed. Check your ID and password.");
    }
  };

  return (
    <div className="min-h-screen flex bg-mist font-body">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[42%] relative bg-power-red overflow-hidden flex-col justify-between px-12 py-14">
        {/* Angular "edge" motif — nods to the university's own graphic device without reproducing it */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.10]"
          viewBox="0 0 400 800"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon points="400,0 400,260 220,0" fill="#FFFFFF" />
          <polygon points="0,800 0,540 180,800" fill="#FFFFFF" />
          <polygon points="400,800 400,600 300,800" fill="#231F20" />
        </svg>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center">
              <span className="font-display text-lg text-power-red">S</span>
            </div>
            <div className="text-white leading-tight">
              <div className="font-display text-lg">Somaiya</div>
              <div className="text-[10px] tracking-[0.14em] uppercase text-white/70">Vidyavihar University</div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/70 text-xs font-body uppercase tracking-[0.16em] mb-3">SmartIssue &middot; Lab Component Kiosk</p>
          <h1 className="font-display text-white text-4xl leading-tight mb-4">
            Tap your card.<br />Place your parts.<br />Walk out verified.
          </h1>
          <p className="text-white/75 text-sm leading-relaxed max-w-sm">
            Every issue is confirmed two ways — your ID authenticates you, and the kiosk camera
            confirms exactly what's leaving the shelf.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-white/60 text-xs font-body">
          <ScanLine size={16} />
          <span>NFC authentication + computer-vision verification</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-md bg-power-red flex items-center justify-center">
              <span className="font-display text-lg text-white">S</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg text-ink">Somaiya</div>
              <div className="text-[10px] tracking-[0.14em] uppercase text-slate">Vidyavihar University</div>
            </div>
          </div>

          <h2 className="font-display text-2xl text-ink mb-1">Sign in to SmartIssue</h2>
          <p className="text-slate text-sm mb-7">Select your role and enter your Somaiya ID to continue.</p>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2.5 mb-7">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isActive = selected === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => {
                    setSelected(r.key);
                    setFormError(null);
                  }}
                  className={`flex flex-col items-center gap-2 rounded-card py-4 px-2 border text-center transition-colors ${
                    isActive
                      ? "border-power-red bg-power-red/[0.06]"
                      : "border-ink/10 bg-paper hover:border-ink/25"
                  }`}
                >
                  <Icon size={20} color={isActive ? "#B7202E" : "#58595B"} strokeWidth={1.8} />
                  <span className={`text-xs font-body font-medium ${isActive ? "text-power-red" : "text-slate"}`}>
                    {r.label}
                  </span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-body font-medium text-slate mb-1.5 uppercase tracking-wide">
                Somaiya ID
              </label>
              <input
                type="text"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder={`e.g. ${DEMO_IDS[selected]}`}
                className="w-full px-3.5 py-2.5 rounded-md border border-ink/15 bg-paper text-ink text-sm font-body placeholder:text-slate/50 focus:border-power-red focus:ring-1 focus:ring-power-red outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-body font-medium text-slate mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-md border border-ink/15 bg-paper text-ink text-sm font-body focus:border-power-red focus:ring-1 focus:ring-power-red outline-none transition"
              />
            </div>

            {formError && (
              <p className="text-xs font-body text-power-red bg-power-red/[0.06] border border-power-red/20 rounded-md px-3 py-2">
                {formError}
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Continue as {activeRole.label} <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-xs font-body text-slate/70">
            Demo password for every account: <span className="font-medium text-ink">password123</span>
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-ink/10" />
            <span className="text-xs text-slate/70 font-body">or</span>
            <div className="h-px flex-1 bg-ink/10" />
          </div>

          <ScanFrame className="mt-6 flex items-center justify-center gap-3 rounded-card border border-dashed border-power-red/40 bg-power-red/[0.03] py-5 px-4">
            <ScanLine size={18} className="text-power-red" />
            <span className="text-sm font-body text-ink">
              At the kiosk? <span className="text-power-red font-medium">Tap your ID card on the NFC reader</span>
            </span>
          </ScanFrame>

          <p className="mt-8 text-center text-xs text-slate/70 font-body">
            {activeRole.desc} — signed in against the SmartIssue prototype API, not yet Somaiya SSO.
          </p>
        </div>
      </div>
    </div>
  );
}
