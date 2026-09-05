// ScanFrame — the project's signature visual motif.
// Four L-shaped corner brackets, like a camera viewfinder / scan reticle,
// echoing the kiosk's own computer-vision scan area. Used sparingly around
// the elements that represent "live verification" in the product.
export default function ScanFrame({ children, active = false, className = "" }) {
  const strokeColor = active ? "#ED1C24" : "#B7202E";
  const corner = (position) => {
    const base = "absolute w-5 h-5";
    const pos = {
      tl: "top-0 left-0",
      tr: "top-0 right-0 -scale-x-100",
      bl: "bottom-0 left-0 -scale-y-100",
      br: "bottom-0 right-0 -scale-x-100 -scale-y-100",
    }[position];
    return (
      <svg
        className={`${base} ${pos}`}
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M1 8V3.5C1 2.11929 2.11929 1 3.5 1H8"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {corner("tl")}
      {corner("tr")}
      {corner("bl")}
      {corner("br")}
      {children}
    </div>
  );
}
