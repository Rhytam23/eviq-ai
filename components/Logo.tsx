import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}
    >
      <span aria-hidden className="grid h-7 w-7 place-items-center rounded-md bg-brand text-volt">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M13.5 2 5 13.5h5.5L9.5 22 19 9.5h-5.5L13.5 2Z" />
        </svg>
      </span>
      <span>EVIQ</span>
    </Link>
  );
}
