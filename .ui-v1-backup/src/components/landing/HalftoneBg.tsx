export function HalftoneBg() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="halftone" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="#111a4a" fillOpacity="0.08" />
        </pattern>
        <radialGradient id="seafoamWash" cx="20%" cy="90%" r="60%">
          <stop offset="0%" stopColor="#44b48b" stopOpacity="0.14" />
          <stop offset="55%" stopColor="#7dd3fc" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#seafoamWash)" />
      <rect width="100%" height="100%" fill="url(#halftone)" />
    </svg>
  );
}
