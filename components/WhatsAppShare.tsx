"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Opens WhatsApp with a ready message and a link to the page at `path` on the current site. */
export default function WhatsAppShare({
  text,
  path,
  label,
  className = "",
}: {
  text: string;
  path: string;
  label: string;
  className?: string;
}) {
  const origin = useSyncExternalStore(
    noop,
    () => window.location.origin,
    () => ""
  );
  const href = `https://wa.me/?${new URLSearchParams({ text: `${text} ${origin}${path}` }).toString()}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 items-center gap-2 ${className}`}
    >
      <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.3 1.3-1.8 1.3-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.5Z" />
      </svg>
      {label}
    </a>
  );
}
