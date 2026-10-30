import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

const used = new Set(
  ["app", "lib", "components"]
    .flatMap((d) => sourceFiles(path.join(ROOT, d)))
    .flatMap((f) =>
      [...readFileSync(f, "utf8").matchAll(/\benv\.([A-Z][A-Z0-9_]+)/g)].map((m) => m[1])
    )
);
used.delete("NODE_ENV"); // set by the runtime, not by the operator

const example = readFileSync(path.join(ROOT, "env", ".env.example"), "utf8");
const rootExample = readFileSync(path.join(ROOT, ".env.example"), "utf8");
const readme = readFileSync(path.join(ROOT, "env", "README.md"), "utf8");

describe("environment variable docs", () => {
  it("finds the variables the code reads", () => {
    expect([...used].sort()).toEqual([
      "ADMIN_TOKEN",
      "LAUNCH_COUNTRIES",
      "NEXT_PUBLIC_SITE_URL",
      "OCM_API_KEY",
      "OCM_API_URL",
      "OVERPASS_API_URL",
      "REPORT_HASH_SALT",
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_URL",
    ]);
  });

  it.each([...used].sort())("%s is in env/.env.example, .env.example and env/README.md", (name) => {
    expect(example).toMatch(new RegExp(`^${name}=`, "m"));
    expect(rootExample).toMatch(new RegExp(`^${name}=`, "m"));
    expect(readme).toContain(`\`${name}\``);
  });

  it("only documents variables the code reads", () => {
    const documented = [...example.matchAll(/^([A-Z][A-Z0-9_]+)=/gm)].map((m) => m[1]);
    expect(documented.sort()).toEqual([...used].sort());
  });

  it("never puts a secret behind NEXT_PUBLIC_", () => {
    const publicVars = [...used].filter((n) => n.startsWith("NEXT_PUBLIC_"));
    expect(publicVars).toEqual(["NEXT_PUBLIC_SITE_URL"]);
  });
});
