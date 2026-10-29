"use client";

import { useRef, useState } from "react";

export interface Place {
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  onPick: (place: Place) => void;
  onLocate: () => void;
  locating: boolean;
}

const MIN_INTERVAL_MS = 1100; // Nominatim allows one request per second at most.

export default function SearchBox({ onPick, onLocate, locating }: Props) {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const lastRequest = useRef(0);
  const cache = useRef(new Map<string, Place[]>());

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2 || status === "loading") return;

    const cached = cache.current.get(q.toLowerCase());
    if (cached) return show(cached);

    const wait = lastRequest.current + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequest.current = Date.now();

    setStatus("loading");
    try {
      const res = await fetch(`/api/geocode?${new URLSearchParams({ q }).toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Search failed");
      cache.current.set(q.toLowerCase(), json.places);
      show(json.places);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Search failed");
    }
  }

  function show(found: Place[]) {
    setStatus("idle");
    if (found.length === 1) return pick(found[0]);
    setPlaces(found);
    setMessage(found.length === 0 ? "No place found. Try a city name or a postcode." : "");
  }

  function pick(place: Place) {
    setPlaces(null);
    setMessage("");
    setQuery(place.name.split(",").slice(0, 2).join(",").trim());
    onPick(place);
  }

  return (
    <div className="relative">
      <form onSubmit={submit} role="search" className="flex gap-2">
        <label className="sr-only" htmlFor="place-search">
          Search for a city or address
        </label>
        <input
          id="place-search"
          type="search"
          value={query}
          maxLength={100}
          onChange={(e) => {
            setQuery(e.target.value);
            setPlaces(null);
            setMessage("");
          }}
          placeholder="Search a city or address"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2.5 text-base placeholder:text-muted/70 md:text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading" || query.trim().length < 2}
          className="rounded-lg bg-brand px-4 text-sm font-medium text-white disabled:opacity-50"
        >
          {status === "loading" ? "Searching" : "Search"}
        </button>
        <button
          type="button"
          onClick={onLocate}
          disabled={locating}
          aria-label="Use my location"
          title="Use my location"
          className="grid w-11 shrink-0 place-items-center rounded-lg border border-line bg-white text-brand disabled:opacity-50"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
            <circle cx="12" cy="12" r="7" />
          </svg>
        </button>
      </form>
      <div aria-live="polite" className="text-xs text-muted">
        {status === "error" && <p className="mt-1.5 text-bad">{message}</p>}
        {status !== "error" && message && <p className="mt-1.5">{message}</p>}
      </div>
      {places && places.length > 1 && (
        <ul className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-line bg-white shadow-lg">
          {places.map((p) => (
            <li key={`${p.lat},${p.lng}`}>
              <button
                type="button"
                onClick={() => pick(p)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-paper focus-visible:bg-paper"
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
