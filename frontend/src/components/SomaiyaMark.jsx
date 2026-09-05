// A typographic stand-in for the official Somaiya Vidyavihar University
// identity. This is deliberately NOT a reproduction of the official logo
// artwork (per university brand guidelines, the logo/seal/wordmark must
// never be recreated) — it's a text lockup using brand colors and type
// so the prototype reads as "Somaiya" without redrawing protected assets.
// Swap this for the official logo file (SVG/PNG from the brand portal)
// before shipping.
export default function SomaiyaMark({ variant = "light", size = "md" }) {
  const isLight = variant === "light";
  const textSize = size === "lg" ? "text-2xl" : "text-lg";
  const subSize = size === "lg" ? "text-[11px]" : "text-[10px]";

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className="flex items-center justify-center w-9 h-9 rounded-md flex-shrink-0"
        style={{ background: isLight ? "#B7202E" : "#FFFFFF" }}
      >
        <span
          className="font-display text-lg"
          style={{ color: isLight ? "#FFFFFF" : "#B7202E" }}
        >
          S
        </span>
      </div>
      <div className="leading-tight">
        <div
          className={`font-display ${textSize}`}
          style={{ color: isLight ? "#231F20" : "#FFFFFF" }}
        >
          Somaiya
        </div>
        <div
          className={`font-body ${subSize} tracking-[0.14em] uppercase`}
          style={{ color: isLight ? "#58595B" : "#FFFFFFcc" }}
        >
          Vidyavihar University
        </div>
      </div>
    </div>
  );
}
