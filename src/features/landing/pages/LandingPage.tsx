import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, BrainCircuit, CheckCircle2, Globe2, Recycle, ScanLine, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { analyticsSummary, wasteCategories } from "@/shared/api/mockApi";
import { AreaTrend, ChartFrame, WastePie } from "@/shared/components/charts";
import { FloatingWasteIcons, HolographicGrid, LottieOrb, ParticleField, ThreeEarth, useGsapReveal } from "@/shared/components/effects";
import { Button, ConfidenceMeter, GlassPanel, Section } from "@/shared/components/ui";
import { useCountUp } from "@/shared/hooks/useCountUp";

function Counter({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const current = useCountUp(value);
  return (
    <div className="border-l border-white/10 pl-5">
      <p className="text-4xl font-semibold tracking-tight text-white">
        {current.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden mesh-gradient px-5 pt-28 sm:px-8">
      <ThreeEarth />
      <ParticleField count={95} />
      <FloatingWasteIcons />
      <HolographicGrid />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.1)_35%,rgba(2,6,23,0.88)_78%)]" />
      <motion.div
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
      >
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100 backdrop-blur-2xl">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,1)]" />
            Enterprise AI for zero-waste operations
          </div>
          <h1 className="text-6xl font-semibold tracking-[-0.08em] text-white sm:text-7xl lg:text-8xl">
            <span className="holographic-text block">EcoVision AI</span>
            <span className="block text-white/88">sees waste as a resource.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Scan, classify, route, measure, and reward every material flow with an AI-powered circular economy platform built for cities, campuses, and enterprises.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/scanner">
              <Button className="w-full sm:w-auto">Start AI scan <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <Link to="/analytics">
              <Button variant="secondary" className="w-full sm:w-auto">View sustainability dashboard</Button>
            </Link>
          </div>
        </div>
        <div className="relative hidden min-h-[540px] items-center justify-center lg:flex">
          <div className="aurora-ring absolute h-80 w-80 rounded-full opacity-80" />
          <div className="absolute right-12 top-14"><LottieOrb /></div>
          <div className="absolute bottom-12 left-10 rounded-full border border-white/10 bg-white/8 px-5 py-3 text-sm text-cyan-100 backdrop-blur-2xl">
            Neural material routing active
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Workflow() {
  useGsapReveal(".workflow-node");
  const steps = [
    { icon: ScanLine, title: "Capture", copy: "Upload, webcam, smart bin QR, or edge camera stream." },
    { icon: BrainCircuit, title: "Classify", copy: "Vision model predicts category, contamination risk, and confidence." },
    { icon: Recycle, title: "Route", copy: "Recommendations adapt to center availability and local rules." },
    { icon: BarChart3, title: "Measure", copy: "Carbon, water, diversion, and ESG reports update instantly." },
  ];

  return (
    <Section eyebrow="AI workflow" title="One operational loop from scan to verified impact." description="EcoVision AI turns fragmented disposal decisions into a measurable circular economy workflow.">
      <div className="relative grid gap-4 lg:grid-cols-4">
        <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent lg:block" />
        {steps.map((step, index) => (
          <div key={step.title} className="workflow-node relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-300 text-slate-950 shadow-[0_0_30px_rgba(52,211,153,0.35)]">
              <step.icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">0{index + 1}</span>
            <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{step.copy}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ScannerPreview() {
  return (
    <Section eyebrow="Live AI scanner" title="Instant visual detection with enterprise-grade traceability." description="Mocked computer vision previews demonstrate bounding boxes, confidence scoring, material context, and downstream disposal guidance.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <GlassPanel className="relative min-h-[420px] overflow-hidden p-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_25%,rgba(52,211,153,0.22),transparent_28rem)]" />
          <div className="relative h-[380px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(52,211,153,0.08)),radial-gradient(circle_at_50%_60%,rgba(255,255,255,0.12),transparent_15rem)]" />
            <div className="scanner-line absolute left-0 top-0 h-28 w-full" />
            <div className="absolute left-[18%] top-[18%] h-[54%] w-[46%] rounded-3xl border-2 border-emerald-300 shadow-[0_0_32px_rgba(52,211,153,0.45)]">
              <span className="absolute -top-10 left-0 rounded-full bg-emerald-300 px-3 py-1 text-xs font-semibold text-slate-950">Plastic bottle 97%</span>
            </div>
            <div className="absolute bottom-7 right-7 flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-emerald-200" /> AI vision stream
            </div>
          </div>
        </GlassPanel>
        <div className="space-y-5">
          <GlassPanel className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Prediction card</h3>
              <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs text-emerald-200">Live mock</span>
            </div>
            <ConfidenceMeter value={97} />
            <div className="mt-6 grid gap-3 text-sm text-slate-300">
              {["Rinse before disposal", "Blue stream accepted", "Estimated 0.41 kg CO2 avoided"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  {item}
                </div>
              ))}
            </div>
          </GlassPanel>
          <GlassPanel className="p-6">
            <h3 className="text-xl font-semibold text-white">Circular handoff</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">Route the item to a verified recovery partner and sync activity with gamification, reports, and analytics.</p>
          </GlassPanel>
        </div>
      </div>
    </Section>
  );
}

function CircularVisualization() {
  const nodes = ["Design", "Use", "Scan", "Recover", "Remake"];
  return (
    <Section eyebrow="Circular economy" title="From linear waste to regenerative material loops." description="Education, routing, rewards, and analytics converge into one circular economy operating layer.">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="relative mx-auto aspect-square w-full max-w-lg">
          <div className="absolute inset-8 rounded-full border border-emerald-300/25" />
          <div className="aurora-ring absolute inset-16 rounded-full opacity-60" />
          {nodes.map((node, index) => {
            const angle = (index / nodes.length) * Math.PI * 2 - Math.PI / 2;
            const x = 50 + Math.cos(angle) * 39;
            const y = 50 + Math.sin(angle) * 39;
            return (
              <motion.div
                key={node}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/80 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl"
                style={{ left: `${x}%`, top: `${y}%` }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4 + index, repeat: Infinity }}
              >
                {node}
              </motion.div>
            );
          })}
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <Globe2 className="mx-auto h-10 w-10 text-emerald-200" />
              <p className="mt-3 text-2xl font-semibold text-white">Closed loop</p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {wasteCategories.map((category) => (
            <div key={category.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-emerald-300/40 hover:bg-white/[0.07]">
              <div className={`mb-4 h-1.5 rounded-full bg-gradient-to-r ${category.tone}`} />
              <h3 className="text-lg font-semibold text-white">{category.label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function AnalyticsPreview() {
  return (
    <Section eyebrow="Impact analytics" title="Executive-ready sustainability intelligence." description="Track diversion, material streams, rewards, and resource savings with visual reporting built on Recharts.">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ChartFrame title="Carbon saved trend">
          <AreaTrend data={analyticsSummary.monthly} />
        </ChartFrame>
        <ChartFrame title="Waste distribution">
          <WastePie data={analyticsSummary.distribution} />
        </ChartFrame>
      </div>
    </Section>
  );
}

function TestimonialsFaq() {
  const testimonials = [
    ["EcoVision AI helped our campus turn contamination data into daily behavior change.", "Nora Patel, University Sustainability"],
    ["The mock AI workflow mirrors the integrations we need for smart buildings and municipal reporting.", "Leo Martins, Smart City Program"],
    ["The interface feels like a climate operations cockpit, not another recycling checklist.", "Sofia Alvarez, ESG Lead"],
  ];
  const faqs = [
    ["Are APIs production connected?", "All endpoints are mocked today, but the Axios client, query layer, auth store, and feature boundaries are backend-ready."],
    ["Can this connect to OpenAI or Gemini?", "Yes. The assistant and scanner services are structured so server-side AI integrations can be swapped in without changing the UI."],
    ["Does the map require a Google key?", "The app uses Google Maps when VITE_GOOGLE_MAPS_API_KEY exists and falls back to a premium simulated map otherwise."],
  ];
  return (
    <Section eyebrow="Trust" title="Designed for adoption across teams, buildings, and cities." description="Premium UI polish, accessibility, and mocked integration seams make the prototype ready for real product discovery.">
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map(([quote, author]) => (
          <GlassPanel key={author} className="p-6">
            <p className="text-base leading-7 text-slate-200">"{quote}"</p>
            <p className="mt-5 text-sm text-emerald-200">{author}</p>
          </GlassPanel>
        ))}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {faqs.map(([question, answer]) => (
          <div key={question} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6">
            <h3 className="font-semibold text-white">{question}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{answer}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Section className="py-16">
        <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          <Counter value={12840} label="Eco points awarded" />
          <Counter value={438} label="Kg CO2 saved" suffix="+" />
          <Counter value={94} label="AI confidence average" suffix="%" />
          <Counter value={56} label="Verified centers synced" />
        </div>
      </Section>
      <Workflow />
      <ScannerPreview />
      <CircularVisualization />
      <AnalyticsPreview />
      <Section className="py-12">
        <GlassPanel className="flex flex-col items-start justify-between gap-6 overflow-hidden p-8 sm:p-10 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-sm text-emerald-100"><ShieldCheck className="h-4 w-4" /> JWT-ready secure workflows</div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">Launch your circular economy command center.</h2>
            <p className="mt-4 max-w-2xl text-slate-300">Explore scanner, maps, reports, gamification, profile, auth, and AI assistant modules in one complete frontend.</p>
          </div>
          <Link to="/scanner"><Button>Open platform <Zap className="h-4 w-4" /></Button></Link>
        </GlassPanel>
      </Section>
      <TestimonialsFaq />
    </>
  );
}