import Nav from "@/components/layout/Nav";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import WhyFail from "@/components/landing/WhyFail";
import MeetEviq from "@/components/landing/MeetEviq";
import DecisionEngine from "@/components/landing/DecisionEngine";
import ProductPreview from "@/components/landing/ProductPreview";
import Architecture from "@/components/architecture/Architecture";
import Roadmap from "@/components/landing/Roadmap";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/layout/Footer";

export default function Page() {
  return (
    <main className="bg-[#05070B] min-h-screen text-white overflow-x-hidden">
      <Nav />
      <Hero />
      <Problem />
      <WhyFail />
      <MeetEviq />
      <DecisionEngine />
      <ProductPreview />
      <Architecture />
      <Roadmap />
      <FinalCta />
      <Footer />
    </main>
  );
}
