import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpenCheck, CheckCircle2, Factory, Leaf, PackageCheck, Recycle, RotateCcw, Trophy, XCircle } from "lucide-react";
import { wasteCategories } from "@/shared/api/mockApi";
import { Button, GlassPanel, PageHeader, ProgressRing } from "@/shared/components/ui";

const lifecycle = [
  { title: "Design", icon: PackageCheck, copy: "Choose reusable, repairable, recyclable materials from the start." },
  { title: "Consume", icon: Leaf, copy: "Use products longer and avoid contamination during disposal." },
  { title: "Detect", icon: BookOpenCheck, copy: "Scan materials so AI can guide correct stream decisions." },
  { title: "Recover", icon: Recycle, copy: "Route to centers, composters, refill loops, and certified handlers." },
  { title: "Regenerate", icon: Factory, copy: "Return recovered materials into new products and soil systems." },
];

const questions = [
  { prompt: "Where should loose lithium batteries go?", options: ["Curbside recycling", "Certified e-waste or hazardous drop-off", "Organic compost"], answer: 1 },
  { prompt: "What improves paper recycling quality?", options: ["Keeping it dry", "Mixing it with food scraps", "Shredding every box"], answer: 0 },
  { prompt: "Why compost food scraps?", options: ["It increases landfill methane", "It turns organics into nutrients", "It makes plastics recyclable"], answer: 1 },
];

export default function CircularEducationPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const score = useMemo(() => questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0), [answers]);
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  return (
    <div className="relative min-h-screen">
      <PageHeader
        label="Circular economy module"
        title="Learn the loop. Improve every disposal decision."
        description="Interactive lifecycle diagrams, sustainability learning, recycling guides, quizzes, and visual infographics for habit-building education."
      />

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <GlassPanel className="relative overflow-hidden p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(52,211,153,0.18),transparent_25rem)]" />
            <div className="relative mx-auto aspect-square max-w-[560px]">
              <div className="absolute inset-12 rounded-full border border-emerald-300/25" />
              <div className="absolute inset-24 rounded-full border border-cyan-300/20" />
              <RotateCcw className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-emerald-200" />
              {lifecycle.map((item, index) => {
                const angle = (index / lifecycle.length) * Math.PI * 2 - Math.PI / 2;
                const x = 50 + Math.cos(angle) * 39;
                const y = 50 + Math.sin(angle) * 39;
                return (
                  <motion.div
                    key={item.title}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    whileHover={{ scale: 1.07 }}
                  >
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-white/10 bg-white/10 text-emerald-200 backdrop-blur-xl">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                  </motion.div>
                );
              })}
            </div>
          </GlassPanel>

          <div className="grid gap-4">
            {lifecycle.map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-300/15 text-emerald-200"><item.icon className="h-5 w-5" /></div>
                  <div>
                    <h2 className="font-semibold text-white">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <GlassPanel className="p-6 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Recycling guides</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Material-specific guidance</h2>
              </div>
              <BookOpenCheck className="h-7 w-7 text-emerald-200" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {wasteCategories.map((category) => (
                <div key={category.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
                  <div className={`mb-4 h-1.5 rounded-full bg-gradient-to-r ${category.tone}`} />
                  <h3 className="text-lg font-semibold text-white">{category.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{category.recommendation}</p>
                  <p className="mt-3 text-sm leading-6 text-emerald-100">{category.impact}</p>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Quiz</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Circularity check</h2>
              </div>
              <ProgressRing value={progress} size={92} />
            </div>
            <div className="mt-6 grid gap-5">
              {questions.map((question, index) => (
                <div key={question.prompt}>
                  <p className="font-medium text-white">{index + 1}. {question.prompt}</p>
                  <div className="mt-3 grid gap-2">
                    {question.options.map((option, optionIndex) => {
                      const selected = answers[index] === optionIndex;
                      const correct = question.answer === optionIndex;
                      return (
                        <button
                          key={option}
                          onClick={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${selected ? (correct ? "border-emerald-300 bg-emerald-300/12 text-emerald-100" : "border-rose-300 bg-rose-300/10 text-rose-100") : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"}`}
                        >
                          {option}
                          {selected ? correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 text-center">
              <Trophy className="mx-auto h-7 w-7 text-amber-200" />
              <p className="mt-3 text-lg font-semibold text-white">Score {score}/{questions.length}</p>
              <p className="mt-2 text-sm text-slate-400">Earn 80 Eco Points when all questions are complete.</p>
              <Button className="mt-4" variant="secondary" onClick={() => setAnswers({})}>Reset quiz</Button>
            </div>
          </GlassPanel>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            ["Material loss", "8B tons of plastic waste have been generated globally since mass production began."],
            ["Food loops", "Composting diverts organics from methane-heavy landfill environments."],
            ["E-waste", "Certified recovery keeps heavy metals away from soil and water."],
            ["Behavior", "Instant feedback makes correct sorting easier at the moment of disposal."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5">
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}