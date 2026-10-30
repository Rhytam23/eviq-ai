import { readFileSync } from "node:fs";
import path from "node:path";

// MapLibre 6 loads its web worker from a URL next to its own script. A bundler moves that script, so
// the worker files are served from here and MapView points MapLibre at them with setWorkerUrl().
// Read at build time and served as static files.
export const dynamic = "force-static";

const FILES = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

export function generateStaticParams() {
  return FILES.map((file) => ({ file }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!FILES.includes(file)) return new Response("Not found", { status: 404 });
  const body = readFileSync(
    path.join(process.cwd(), "node_modules", "maplibre-gl", "dist", file),
    "utf8"
  );
  return new Response(body, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
