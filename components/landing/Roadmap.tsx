const COLUMNS = [
  {
    title: "Built and working",
    tone: "bg-ok",
    items: [
      "Live map that auto-locates you and searches any city",
      "Charger data from Open Charge Map and OpenStreetMap, source shown per station",
      "One-tap working / broken / busy reports with a server-side cooldown",
      "Open, rule-based status with unit tests",
      "Connector and power filters, km or miles",
    ],
  },
  {
    title: "Next",
    tone: "bg-warn",
    items: [
      "Persistent report storage in production and a first pilot city",
      "Per-charger report history and a reliability trend",
      "Stronger abuse resistance, such as weighting repeat reporters",
      "A keyed read API for design partners",
    ],
  },
  {
    title: "Later, not started",
    tone: "bg-unknown",
    items: [
      "Integrations with routing apps and vehicle makers",
      "Operator dashboard for how drivers see each site",
      "Verification from charging sessions and vehicle data, where partners allow it",
      "More registries merged behind one station identity",
    ],
  },
];

export default function Roadmap() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {COLUMNS.map((c) => (
        <div key={c.title} className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="flex items-center gap-2 font-serif text-2xl">
            <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${c.tone}`} />
            {c.title}
          </h3>
          <ul className="mt-5 space-y-3 text-[15px]">
            {c.items.map((item) => (
              <li key={item} className="border-t border-line pt-3 first:border-0 first:pt-0">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
