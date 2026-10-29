import StatusBadge from "@/components/StatusBadge";
import {
  COOLDOWN_MINUTES,
  BROKEN_WINDOW_HOURS,
  REPORT_RETENTION_HOURS,
  VERIFIED_WINDOW_HOURS,
} from "@/lib/reliability";
import { STATUS_RULES } from "@/lib/statusMeta";
import type { Reliability } from "@/types/station";

const ORDER: { status: Reliability; example: string }[] = [
  { status: "reported-broken", example: "Reported broken · 1 h ago" },
  { status: "verified", example: "Verified working · 12 min ago" },
  { status: "operator-offline", example: "Operator says offline" },
  { status: "unverified", example: "Unverified" },
];

function Timeline() {
  const pct = (h: number) => `${(h / REPORT_RETENTION_HOURS) * 100}%`;
  const marks = [
    {
      at: VERIFIED_WINDOW_HOURS,
      label: `${VERIFIED_WINDOW_HOURS} h`,
      note: "A working report stops counting as verified",
    },
    {
      at: BROKEN_WINDOW_HOURS,
      label: `${BROKEN_WINDOW_HOURS} h`,
      note: "A broken report stops flagging the charger",
    },
    {
      at: REPORT_RETENTION_HOURS,
      label: `${REPORT_RETENTION_HOURS} h`,
      note: "Reports are ignored entirely",
    },
  ];
  return (
    <figure
      aria-label="How long a report counts"
      className="rounded-2xl border border-line bg-surface p-6 md:p-8"
    >
      <figcaption className="text-sm font-semibold">How long a report counts</figcaption>
      <div className="relative mt-10 h-3 rounded-full bg-paper">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-ok"
          style={{ width: pct(VERIFIED_WINDOW_HOURS) }}
        />
        <div
          className="absolute inset-y-0 rounded-full bg-bad/70"
          style={{
            left: pct(VERIFIED_WINDOW_HOURS),
            width: `calc(${pct(BROKEN_WINDOW_HOURS)} - ${pct(VERIFIED_WINDOW_HOURS)})`,
          }}
        />
        {marks.map((m) => (
          <span
            key={m.at}
            className="absolute top-full mt-2 -translate-x-1/2 whitespace-nowrap text-xs font-medium tabular-nums last:-translate-x-full"
            style={{ left: pct(m.at) }}
          >
            {m.label}
          </span>
        ))}
        <span className="absolute left-0 top-full mt-2 text-xs font-medium">now</span>
      </div>
      <ul className="mt-12 grid gap-3 text-sm text-muted md:grid-cols-3">
        <li>
          <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-ok" />
          {`Working or busy: counts for ${VERIFIED_WINDOW_HOURS} hours.`}
        </li>
        <li>
          <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-bad/70" />
          {`Broken: counts for ${BROKEN_WINDOW_HOURS} hours. Bad news lingers longer than good news.`}
        </li>
        <li>
          <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-line" />
          {`After ${REPORT_RETENTION_HOURS} hours a report no longer affects anything.`}
        </li>
      </ul>
    </figure>
  );
}

export default function StatusRules() {
  return (
    <div className="space-y-10">
      <ol className="grid gap-4 md:grid-cols-2">
        {ORDER.map(({ status, example }, i) => (
          <li key={status} className="rounded-2xl border border-line bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Rule {i + 1}
            </p>
            <div className="mt-3">
              <StatusBadge status={status} text={example} />
            </div>
            <p className="mt-4 text-[15px] leading-relaxed">{STATUS_RULES[status]}</p>
          </li>
        ))}
      </ol>
      <p className="max-w-2xl text-muted">
        Rules are checked in this order, and the newest report wins. A fresh driver report overrides
        the operator in both directions, because it is newer than anything the operator published.
      </p>
      <Timeline />
      <div className="rounded-2xl border border-line bg-surface p-6 md:p-8">
        <h3 className="font-serif text-2xl">Keeping it honest</h3>
        <ul className="mt-4 grid gap-x-10 gap-y-3 text-[15px] text-muted md:grid-cols-2">
          <li>{`One report per charger per device and network every ${COOLDOWN_MINUTES} minutes, enforced on the server.`}</li>
          <li>
            Per-address rate limits on every endpoint, and strict validation of every request.
          </li>
          <li>
            Reports are stored with a one-way hash of the sender, never the address or location
            itself.
          </li>
          <li>
            Every station shows where its data comes from, and what we do not know stays marked
            unknown.
          </li>
        </ul>
      </div>
    </div>
  );
}
