import { STATUS_LABELS, STATUS_STYLES } from "@/lib/statusMeta";
import type { Reliability } from "@/types/station";

export function StatusDot({ status, className = "" }: { status: Reliability; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_STYLES[status].dot} ${className}`}
    />
  );
}

export default function StatusBadge({ status, text }: { status: Reliability; text?: string }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${s.bg} ${s.text}`}
    >
      <StatusDot status={status} />
      {text ?? STATUS_LABELS[status]}
    </span>
  );
}
