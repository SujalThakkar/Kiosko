export default function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 font-body font-medium rounded-md transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-6 py-3",
  };
  const variants = {
    primary: "bg-power-red text-white hover:bg-vitality-red",
    secondary: "bg-trust-blue text-white hover:bg-link-blue",
    outline: "border border-slate/30 text-ink hover:border-power-red hover:text-power-red bg-transparent",
    ghost: "text-slate hover:text-ink hover:bg-mist",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
