import Link from "next/link";
import { INDIA_CITIES, cityMapHref } from "@/lib/cities";

// Rough bounds of mainland India, enough to place city pins. There is deliberately no outline.
const LNG = [68, 98] as const;
const LAT = [35, 7] as const;
// Cities close together get their label on the left so names never overlap.
const LABEL_LEFT = new Set(["Mumbai", "Bengaluru"]);

/** Pins at real city positions whose colours cycle through example statuses. Decorative, not live data. */
export default function PinField({ note, queryString }: { note: string; queryString: string }) {
  return (
    <figure>
      <div className="relative aspect-[6/5] overflow-hidden rounded-2xl border border-line bg-surface bg-[linear-gradient(to_right,rgba(20,24,27,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,24,27,0.06)_1px,transparent_1px)] bg-[size:12.5%_14.3%]">
        {INDIA_CITIES.map((c, i) => {
          const x = ((c.lng - LNG[0]) / (LNG[1] - LNG[0])) * 100;
          const y = ((LAT[0] - c.lat) / (LAT[0] - LAT[1])) * 100;
          const href = cityMapHref(c) + (queryString ? `&${queryString}` : "");
          return (
            <Link
              key={c.name}
              href={href}
              className="group absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span
                aria-hidden
                className="pin-dot h-3.5 w-3.5 rounded-full ring-4 ring-white transition-transform group-hover:scale-150"
                style={{ animationDelay: `${-i * 1.3}s` }}
              />
              <span
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-surface/90 px-1.5 py-0.5 text-xs font-medium text-ink ${
                  LABEL_LEFT.has(c.name) ? "right-full mr-0.5" : "left-full ml-0.5"
                }`}
              >
                {c.name}
              </span>
            </Link>
          );
        })}
      </div>
      <figcaption className="mt-3 text-xs text-muted">{note}</figcaption>
    </figure>
  );
}
