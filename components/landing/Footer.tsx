import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            The driver-verified reliability layer for EV charging. Built by Rhytam Biswas.
          </p>
        </div>
        <nav aria-label="Product" className="text-sm">
          <p className="font-semibold">Product</p>
          <ul className="mt-3 space-y-2 text-muted">
            <li>
              <Link className="hover:text-ink" href="/map">
                Live map
              </Link>
            </li>
            <li>
              <a className="hover:text-ink" href="https://github.com/Rhytam23/eviq-ai">
                Source on GitHub
              </a>
            </li>
            <li>
              <Link className="hover:text-ink" href="/privacy">
                Privacy
              </Link>
            </li>
          </ul>
        </nav>
        <div className="text-sm">
          <p className="font-semibold">Contact</p>
          <p className="mt-3 text-muted">
            <a className="underline" href="mailto:founders@eviq.ai">
              founders@eviq.ai
            </a>
          </p>
          <p className="mt-6 text-xs text-muted">
            Charger data: Open Charge Map (CC BY 4.0) and © OpenStreetMap contributors (ODbL). Map
            tiles © CARTO.
          </p>
        </div>
      </div>
    </footer>
  );
}
