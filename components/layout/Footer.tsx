import { Container } from "@/components/ui/Container";

export default function Footer() {
  return (
    <footer className="bg-[#05070B] text-[#8e9fb1] border-t border-white/[0.07]">
      <Container>
        <div className="py-14 grid md:grid-cols-4 gap-10 text-[13.5px]">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-[26px] h-[26px] rounded-[8px] bg-slate-900 flex items-center justify-center">
                <div className="w-[9px] h-[9px] rounded-[3px] bg-orange" />
              </div>
              <span className="text-white font-[620] text-[16px] tracking-[-0.01em]">EVIQ AI</span>
            </div>
            <p className="mt-3 max-w-[420px] text-[#7f8f9f] leading-relaxed">
              AI Charging Intelligence for Every EV Journey. The operating system for EV mobility intelligence.
            </p>
            <p className="mt-4 text-[12px] text-[#607080]">
              © {new Date().getFullYear()} EVIQ AI, Inc. · San Francisco · Singapore
            </p>
          </div>
          <div>
            <div className="text-white font-[600] text-[12.5px] tracking-wide">Product</div>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="#product" className="hover:text-white">
                  Platform
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-white">
                  Architecture
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-white">
                  Live demo
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Security
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-white font-[600] text-[12.5px] tracking-wide">Company</div>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  Careers
                </a>
              </li>
              <li>
                <a href="mailto:founders@eviq.ai" className="hover:text-white">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.07] py-5 text-[11.5px] text-[#5b6b7b] flex flex-wrap justify-between gap-3">
          <span>Engineered for mission-critical EV mobility intelligence.</span>
          <span>v1.0 private beta • founders@eviq.ai</span>
        </div>
      </Container>
    </footer>
  );
}
