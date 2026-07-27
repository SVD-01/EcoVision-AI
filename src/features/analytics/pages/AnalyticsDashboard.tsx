import { useQuery } from "@tanstack/react-query";
import { Activity, Droplets, Leaf, LineChart as LineChartIcon, Sprout, Target, Trees, Wind } from "lucide-react";
import { fetchAnalytics } from "@/shared/api/mockApi";
import { AreaTrend, BarTrend, ChartFrame, LineTrend, WastePie } from "@/shared/components/charts";
import { GlassPanel, MetricTile, PageHeader, ProgressRing, Skeleton } from "@/shared/components/ui";

export default function AnalyticsDashboard() {
  const analytics = useQuery({ queryKey: ["analytics"], queryFn: fetchAnalytics });
  const data = analytics.data;

  return (
    <div className="relative min-h-screen">
      <PageHeader
        label="Analytics dashboard"
        title="Measure sustainability performance in real time."
        description="Eco Score, Sustainability Score, Carbon Saved, Water Conserved, Trees Protected, distribution, weekly and monthly analytics, activity timeline, KPI cards, and progress rings."
      />

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        {analytics.isLoading || !data ? (
          <div className="grid gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-40" />)}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricTile icon={<Target className="h-5 w-5" />} label="Eco Score" value={`${data.ecoScore}/100`} detail="Top 6% of teams" />
              <MetricTile icon={<Leaf className="h-5 w-5" />} label="Sustainability Score" value={`${data.sustainabilityScore}/100`} detail="12% above goal" />
              <MetricTile icon={<Wind className="h-5 w-5" />} label="Carbon Saved" value={`${data.carbonSaved} kg`} detail="CO2 equivalent" />
              <MetricTile icon={<Droplets className="h-5 w-5" />} label="Water Conserved" value={`${data.waterConserved.toLocaleString()} L`} detail="This cycle" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <GlassPanel className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-1">
                <div className="flex items-center gap-5">
                  <ProgressRing value={data.ecoScore} />
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Eco Score</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Behavior quality</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">Weighted by correct scans, contamination prevention, route completion, and daily streaks.</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <ProgressRing value={data.sustainabilityScore} />
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Sustainability</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Resource efficiency</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">Tracks carbon, water, tree, and landfill diversion indicators across all users.</p>
                  </div>
                </div>
              </GlassPanel>
              <ChartFrame title="Monthly carbon saved">
                <AreaTrend data={data.monthly} />
              </ChartFrame>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <ChartFrame title="Waste distribution"><WastePie data={data.distribution} /></ChartFrame>
              <ChartFrame title="Weekly scans"><BarTrend data={data.weekly} /></ChartFrame>
              <ChartFrame title="Eco points"><LineTrend data={data.monthly} /></ChartFrame>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <ChartFrame title="Weekly water conserved" action={<LineChartIcon className="h-5 w-5 text-emerald-200" />}>
                <AreaTrend data={data.weekly} dataKey="water" />
              </ChartFrame>
              <GlassPanel className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Activity timeline</h2>
                  <Activity className="h-5 w-5 text-emerald-200" />
                </div>
                <div className="relative grid gap-5">
                  <div className="absolute bottom-3 left-3 top-3 w-px bg-white/10" />
                  {data.timeline.map((item) => (
                    <div key={item.id} className="relative flex gap-4 pl-1">
                      <span className="mt-1 h-5 w-5 rounded-full border border-emerald-300 bg-slate-950 shadow-[0_0_22px_rgba(52,211,153,0.4)]" />
                      <div>
                        <p className="font-medium text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
                        <p className="mt-1 text-sm text-emerald-200">{item.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MetricTile icon={<Trees className="h-5 w-5" />} label="Trees Protected" value={`${data.treesProtected}`} detail="Estimated equivalent" />
              <MetricTile icon={<Sprout className="h-5 w-5" />} label="Landfill Diversion" value="74%" detail="Month to date" />
              <MetricTile icon={<Activity className="h-5 w-5" />} label="Active Scanners" value="318" detail="Across 12 sites" />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}