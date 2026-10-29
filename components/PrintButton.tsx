"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center rounded-full bg-brand px-6 font-medium text-white print:hidden"
    >
      Print this sticker
    </button>
  );
}
