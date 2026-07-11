import Nav from "@/components/layout/Nav";
import Hero from "@/components/landing/Hero";
import AIDecisionStrip from "@/components/dashboard/AIDecisionStrip";
import Problem from "@/components/landing/Problem";
import SolutionPipeline from "@/components/landing/SolutionPipeline";
import Features from "@/components/landing/Features";
import LiveDashboard from "@/components/dashboard/LiveDashboard";
import Copilot from "@/components/dashboard/Copilot";
import Architecture from "@/components/architecture/Architecture";
import Verticals from "@/components/landing/Verticals";
import Impact from "@/components/landing/Impact";
import Roadmap from "@/components/landing/Roadmap";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/layout/Footer";

export default function Page() {
  return (
    <main>
      <Nav />
      <Hero />
      <AIDecisionStrip />
      <Problem />
      <SolutionPipeline />
      <Features />
      <LiveDashboard />
      <Copilot />
      <Architecture />
      <Verticals />
      <Impact />
      <Roadmap />
      <FinalCta />
      <Footer />
    </main>
  );
}
