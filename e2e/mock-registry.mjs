// Tiny stand-in for Open Charge Map and Overpass, used only by the e2e tests so the real server code
// path (providers, normalisers, report merge, share pages) runs without internet access.
// It serves the hand-written fixtures from tests/fixtures. The stations in them are NOT real.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const fixture = (name) =>
  JSON.parse(
    readFileSync(fileURLToPath(new URL(`../tests/fixtures/${name}`, import.meta.url)), "utf8")
  );
const overpass = fixture("overpass.json");
const ocm = fixture("ocm.json");
const port = Number(process.env.MOCK_REGISTRY_PORT ?? 3290);

createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${port}`);
  const send = (body, status = 200) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  };
  if (url.pathname === "/health") return send({ ok: true });
  if (url.pathname === "/api/interpreter") {
    const query = url.searchParams.get("data") ?? "";
    const byId = query.match(/(node|way|relation)\((\d+)\);out/);
    if (byId) {
      const el = overpass.elements.find((e) => e.type === byId[1] && String(e.id) === byId[2]);
      return send({ elements: el ? [el] : [] });
    }
    return send(overpass);
  }
  if (url.pathname === "/v3/poi/") {
    if (req.headers["x-api-key"] !== "mock-ocm-key") return send({ error: "bad key" }, 403);
    const id = url.searchParams.get("chargepointid");
    return send(id ? ocm.filter((p) => String(p.ID) === id) : ocm);
  }
  send({ error: "not found" }, 404);
}).listen(port, () => console.log(`mock registry on ${port}`));
