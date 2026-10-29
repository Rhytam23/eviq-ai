"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#F6F5F0",
          color: "#14181B",
          padding: "3rem 1.25rem",
        }}
      >
        <h1>EVIQ hit an unexpected error.</h1>
        <p>Please reload the page.</p>
        <button type="button" onClick={reset} style={{ minHeight: 44, padding: "0 1.5rem" }}>
          Reload
        </button>
      </body>
    </html>
  );
}
