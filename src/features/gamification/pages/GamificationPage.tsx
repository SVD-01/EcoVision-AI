import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, CheckCircle2, Flame, Gift, Medal, Shield, Sparkles, Star, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";
import { fetchGamification } from "@/shared/api/mockApi";
import type { Challenge } from "@/shared/api/types";
import { ConfettiBurst } from "@/shared/components/effects";
import { Button, GlassPanel, MetricTile, PageHeader, ProgressRing, Skeleton } from "@/shared/components/ui";
import { useEcoStore } from "@/shared/stores/ecoStore";

function ChallengeRow({ challenge, completed, onComplete }: { challenge: Challenge; completed: boolean; onComplete: () => void }) {
  const percent = Math.min(100, Math.round((challenge.progress / challenge.goal) * 100));
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">{challenge.title}</h3>
          <p className="mt-1 text-sm text-emerald-200">+{challenge.reward} Eco Points</p>
        </div>
        {completed ? <CheckCircle2 className="h-6 w-6 text-emerald-300" /> : <Button variant="secondary" className="px-4 py-2" onClick={onComplete}>Claim</Button>}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${completed ? 100 : percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">{completed ? challenge.goal : challenge.progress}/{challenge.goal} complete</p>
    </div>
  );
}

export default function GamificationPage() {
  const game = useQuery({ queryKey: ["gamification"], queryFn: fetchGamification });
  const { completedChallenges, completeChallenge } = useEcoStore();
  const [confetti, setConfetti] = useState(false);
  const data = game.data;

  const claim = (challengeId: string, reward: number) => {
    completeChallenge(challengeId);
    setConfetti(true);
    toast.success(`Challenge complete. +${reward} Eco Points awarded.`);
    window.setTimeout(() => setConfetti(false), 2600);
  };

  return (
    <div className="relative min-h-screen">
      <ConfettiBurst active={confetti} />
      <PageHeader
        label="Gamification"
        title="Turn climate-positive action into daily momentum."
        description="Eco Points, XP, levels, achievements, badges, leaderboards, challenges, weekly missions, rewards, streak tracking, and confetti animations."
      />

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        {game.isLoading || !data ? (
          <div className="grid gap-6 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-44" />)}</div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricTile icon={<Sparkles className="h-5 w-5" />} label="Eco Points" value={data.points.toLocaleString()} detail="Lifetime balance" />
              <MetricTile icon={<Zap className="h-5 w-5" />} label="XP" value={data.xp.toLocaleString()} detail={`${data.nextLevelXp - data.xp} to next level`} />
              <MetricTile icon={<Trophy className="h-5 w-5" />} label="Level" value={`${data.level}`} detail="Circular leader" />
              <MetricTile icon={<Flame className="h-5 w-5" />} label="Streak" value={`${data.streak} days`} detail="Keep it alive" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <GlassPanel className="p-6 text-center">
                <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-[2rem] bg-gradient-to-br from-emerald-300 to-cyan-300 text-slate-950 shadow-[0_0_44px_rgba(52,211,153,0.35)]">
                  <Shield className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-semibold text-white">Level {data.level}</h2>
                <p className="mt-2 text-slate-400">EcoVision Guardian</p>
                <div className="mt-6"><ProgressRing value={Math.round((data.xp / data.nextLevelXp) * 100)} label="XP progress" /></div>
                <p className="mt-4 text-sm text-emerald-200">{data.xp.toLocaleString()} / {data.nextLevelXp.toLocaleString()} XP</p>
              </GlassPanel>

              <GlassPanel className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Achievements and badges</h2>
                  <Award className="h-5 w-5 text-emerald-200" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {data.achievements.map((achievement) => (
                    <div key={achievement.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                      <div className="flex items-start gap-4">
                        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${achievement.unlocked ? "bg-emerald-300 text-slate-950" : "bg-white/8 text-slate-300"}`}>
                          <Medal className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{achievement.name}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-400">{achievement.description}</p>
                        </div>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${achievement.progress}%` }} /></div>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <GlassPanel className="p-6">
                <h2 className="mb-5 text-xl font-semibold text-white">Daily challenges</h2>
                <div className="grid gap-4">
                  {data.daily.map((challenge) => (
                    <ChallengeRow key={challenge.id} challenge={challenge} completed={completedChallenges.includes(challenge.id)} onComplete={() => claim(challenge.id, challenge.reward)} />
                  ))}
                </div>
              </GlassPanel>
              <GlassPanel className="p-6">
                <h2 className="mb-5 text-xl font-semibold text-white">Weekly missions</h2>
                <div className="grid gap-4">
                  {data.weekly.map((challenge) => (
                    <ChallengeRow key={challenge.id} challenge={challenge} completed={completedChallenges.includes(challenge.id)} onComplete={() => claim(challenge.id, challenge.reward)} />
                  ))}
                </div>
              </GlassPanel>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <GlassPanel className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Global leaderboard</h2>
                  <Trophy className="h-5 w-5 text-amber-200" />
                </div>
                <div className="grid gap-3">
                  {data.leaderboard.map((entry) => (
                    <div key={entry.rank} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-center gap-4">
                        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/8 font-semibold text-emerald-200">{entry.rank}</span>
                        <div>
                          <p className="font-semibold text-white">{entry.name}</p>
                          <p className="text-sm text-slate-500">{entry.city}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-emerald-200">{entry.points.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </GlassPanel>

              <GlassPanel className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Rewards vault</h2>
                  <Gift className="h-5 w-5 text-emerald-200" />
                </div>
                <div className="grid gap-4">
                  {["Team tree planting credit", "Reusable lunch kit", "Smart bin NFC badge", "Carbon audit export"].map((reward, index) => (
                    <div key={reward} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-amber-200" />
                        <span className="text-white">{reward}</span>
                      </div>
                      <span className="text-sm text-slate-400">{(index + 2) * 900} pts</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}