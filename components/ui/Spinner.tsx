"use client";
export default function Spinner({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle cx="25" cy="25" r="20" stroke="#e5e7eb" strokeWidth="6" fill="none" />
      <path d="M45 25a20 20 0 0 1-20 20" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  );
}
