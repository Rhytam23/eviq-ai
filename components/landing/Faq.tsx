const FAQ = [
  {
    q: "How do you know a report is true?",
    a: "We do not, and the product is built around that. A single report is one driver's word, so it expires, it is rate limited, one device can only report a charger once every ten minutes, and the newest report always wins so a wrong one is corrected by the next driver. Weighting reporters by track record is on the roadmap, not built.",
  },
  {
    q: "Why not just trust the operator's app?",
    a: "Operator data is a useful signal and we show it. But it comes from one source with its own incentives and update cycle, and many chargers have no status published at all. Drivers are on site at the moment it matters.",
  },
  {
    q: "Does it work in my country?",
    a: "The map and reports work anywhere in the world. How many chargers you see depends on how well your area is mapped in OpenStreetMap and Open Charge Map, and we say so when an area comes back empty. Driver reports are only as good as the number of drivers reporting, so a new area starts as mostly unverified.",
  },
  {
    q: "What do you store about me?",
    a: "Each report stores the charger, the status, the time, and a one-way hash of your network address and browser. We do not save your location in our database, and there are no accounts. Details are on the privacy page.",
  },
  {
    q: "Where does the charger data come from, and can I reuse it?",
    a: "From Open Charge Map (CC BY 4.0) and OpenStreetMap contributors (ODbL), credited on every station. The driver reports are our own data. Using the reliability data in your product is what the planned API is for.",
  },
  {
    q: "Is it free?",
    a: "The map is free for drivers today. The company plans to earn money from the data API for businesses, not from drivers. There is no pricing yet.",
  },
];

export default function Faq() {
  return (
    <div className="max-w-3xl divide-y divide-line border-y border-line">
      {FAQ.map((f) => (
        <details key={f.q} className="group py-5">
          <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-6 text-lg font-medium">
            {f.q}
            <span
              aria-hidden
              className="mt-1 text-xl leading-none text-brand transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
