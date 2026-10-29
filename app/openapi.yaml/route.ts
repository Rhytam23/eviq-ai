import { readFileSync } from "node:fs";
import path from "node:path";

// Read at build time so the deployed file always matches docs/openapi.yaml.
export const dynamic = "force-static";

export function GET() {
  const body = readFileSync(path.join(process.cwd(), "docs", "openapi.yaml"), "utf8");
  return new Response(body, {
    headers: {
      "Content-Type": "application/yaml; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
