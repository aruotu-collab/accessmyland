import Link from "next/link";

export function Logo({
  className = "",
  markClass = "h-8 w-8",
  word = true,
}: {
  className?: string;
  markClass?: string;
  word?: boolean;
}) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 40 40" className={markClass} aria-hidden>
        <rect width="40" height="40" rx="10" fill="#12382B" />
        <path
          d="M8 26.5 20 8.5 32 26.5H8Z"
          fill="#C4A056"
          opacity="0.95"
        />
        <path
          d="M14 26.5 20 16.5 26 26.5"
          fill="#F3EEE4"
        />
        <path
          d="M8 26.5h24v3.2H8z"
          fill="#0B241C"
        />
        <circle cx="20" cy="22" r="1.6" fill="#12382B" />
      </svg>
      {word && (
        <span className="font-serif text-[1.15rem] leading-none tracking-tight text-forest">
          Access<span className="text-brass">My</span>Land
        </span>
      )}
    </Link>
  );
}
