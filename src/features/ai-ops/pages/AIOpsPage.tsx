import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  Activity, AlertTriangle, BrainCircuit, CheckCircle2, Cpu,
  Database, FlaskConical, GitBranch, Layers,
  MonitorDot, Network, Server, Shield, Sparkles, Target, Thermometer, Timer,
} from "lucide-react";
import { fetchAIOpsDashboard } from "@/shared/api/aiEngineApi";
import { GlassPanel, MetricTile, PageHeader, Skeleton } from "@/shared/components/ui";

const tt = { background: "rgba(2,6,23,0.92)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", color: "#f8fafc" };

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-300 text-slate-950",
    staging: "bg-amber-300 text-slate-950",
    archived: "bg-slate-500 text-white",
    training: "bg-cyan-300 text-slate-950",
    UP: "bg-emerald-300 text-slate-950",
    HEALTHY: "bg-emerald-300 text-slate-950",
    success: "bg-emerald-300/15 text-emerald-200 border border-emerald-300/30",
    failed: "bg-rose-300/15 text-rose-200 border border-rose-300/30",
    stable: "bg-emerald-300/15 text-emerald-200",
    warning: "bg-amber-300/15 text-amber-200",
  };
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${map[status] || "bg-white/10 text-white"}`}>{status}</span>;
}

function HeatmapCell({ value, max }: { value: number; max: number }) {
  const intensity = Math.min(1, value / max);
  const bg = value > max * 0.7 ? `rgba(52,211,153,${0.3 + intensity * 0.6})` : `rgba(34,211,238,${0.15 + intensity * 0.4})`;
  return (
    <div className="grid h-10 w-full place-items-center rounded-lg text-xs font-semibold text-white" style={{ background: bg }}>
      {value}
    </div>
  );
}

/* MiniChart available for future KPI sparklines */

export default function AIOpsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["ai-ops-dashboard"], queryFn: fetchAIOpsDashboard, refetchInterval: 30000 });
  const [trainingView, setTrainingView] = useState<"loss" | "accuracy">("loss");

  if (isLoading || !data) {
    return (
      <div className="relative min-h-screen">
        <PageHeader label="AI Operations" title="Loading AI engine telemetry..." description="Connecting to EcoVision AI microservice." />
        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-4">{Array.from({ length: 12 }, (_, i) => <Skeleton key={i} className="h-44" />)}</div>
        </section>
      </div>
    );
  }

  const d = data;
  const h = d.system_health;
  const m = d.model_info.metrics;
  const ia = d.inference_analytics;

  return (
    <div className="relative min-h-screen">
      <PageHeader
        label="AI Operations Dashboard"
        title="Neural network command center."
        description="Model performance, training analytics, inference telemetry, GPU monitoring, drift detection, deployment history, and AI health — all in one enterprise control plane."
      />

      <section className="mx-auto max-w-7xl space-y-6 px-5 pb-20 sm:px-8">

        {/* ── Row 1: System Status KPIs ──────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricTile icon={<MonitorDot className="h-5 w-5" />} label="System Status" value={h.status} detail={`Uptime ${h.uptime_formatted}`} />
          <MetricTile icon={<Target className="h-5 w-5" />} label="Model Accuracy" value={`${(d.active_model.accuracy * 100).toFixed(1)}%`} detail={`mAP@50 ${(d.active_model.mAP50 * 100).toFixed(1)}%`} />
          <MetricTile icon={<Sparkles className="h-5 w-5" />} label="Predictions Today" value={ia.total_predictions_today.toLocaleString()} detail={`Avg ${ia.avg_confidence_today}% conf`} />
          <MetricTile icon={<Timer className="h-5 w-5" />} label="Avg Latency" value={`${m.avg_inference_ms}ms`} detail={`${d.api_performance.total_requests_today.toLocaleString()} API requests`} />
          <MetricTile icon={<Shield className="h-5 w-5" />} label="Drift Score" value={ia.drift_score.toFixed(4)} detail={<StatusBadge status={ia.drift_status} /> as any} />
        </div>

        {/* ── Row 2: Active Model + Hardware ─────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <GlassPanel className="p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <BrainCircuit className="h-7 w-7 text-emerald-200" />
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{d.active_model.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">{d.active_model.framework} • v{d.active_model.version}</p>
                  </div>
                </div>
              </div>
              <StatusBadge status="active" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ["Accuracy", (m.accuracy * 100).toFixed(1) + "%"],
                ["Precision", (m.precision * 100).toFixed(1) + "%"],
                ["Recall", (m.recall * 100).toFixed(1) + "%"],
                ["F1 Score", (m.f1_score * 100).toFixed(1) + "%"],
                ["mAP@50", (m.mAP50 * 100).toFixed(1) + "%"],
                ["mAP@50-95", (m.mAP50_95 * 100).toFixed(1) + "%"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                  <p className="text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-1 text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
              <div className="text-slate-400">Parameters: <span className="text-white">{(d.model_info.parameters_count / 1e6).toFixed(1)}M</span></div>
              <div className="text-slate-400">FLOPs: <span className="text-white">{d.model_info.flops_giga}G</span></div>
              <div className="text-slate-400">Weights: <span className="text-white">{d.model_info.weights_size_mb}MB</span></div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white"><Cpu className="h-5 w-5 text-emerald-200" /> Hardware Telemetry</h2>
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">GPU {h.gpu.device.split("(")[0]}</span><span className="text-emerald-200">{h.gpu.utilization_percent}%</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${h.gpu.utilization_percent}%` }} /></div>
                <div className="mt-2 flex justify-between text-xs text-slate-500"><span>VRAM {Math.round(h.gpu.memory_used_mb / 1024)}GB/{Math.round(h.gpu.memory_total_mb / 1024)}GB</span><span><Thermometer className="mr-1 inline h-3 w-3" />{h.gpu.temperature_celsius}°C</span></div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">CPU ({h.cpu.cores} cores)</span><span className="text-cyan-200">{h.cpu.utilization_percent}%</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-300" style={{ width: `${h.cpu.utilization_percent}%` }} /></div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">Memory</span><span className="text-violet-200">{h.memory.utilization_percent}%</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-300 to-fuchsia-300" style={{ width: `${h.memory.utilization_percent}%` }} /></div>
                <p className="mt-2 text-xs text-slate-500">{Math.round(h.memory.used_mb / 1024)}GB / {Math.round(h.memory.total_mb / 1024)}GB</p>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">Storage</span><span className="text-amber-200">{Math.round(h.storage.used_gb)}GB / {h.storage.total_gb}GB</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-300" style={{ width: `${(h.storage.used_gb / h.storage.total_gb) * 100}%` }} /></div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* ── Row 3: Training Loss & Accuracy Charts ────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          <GlassPanel className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Training & Validation Loss</h3>
              <div className="flex gap-1">
                {(["loss", "accuracy"] as const).map((v) => (
                  <button key={v} onClick={() => setTrainingView(v)} className={`rounded-full px-3 py-1.5 text-xs capitalize ${trainingView === v ? "bg-emerald-300 text-slate-950" : "bg-white/8 text-slate-300"}`}>{v}</button>
                ))}
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={d.training_history} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis dataKey="epoch" stroke="#94a3b8" axisLine={false} tickLine={false} interval={9} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tt} />
                  {trainingView === "loss" ? (
                    <>
                      <Line type="monotone" dataKey="train_loss" stroke="#22d3ee" strokeWidth={2} dot={false} name="Train Loss" />
                      <Line type="monotone" dataKey="val_loss" stroke="#f472b6" strokeWidth={2} dot={false} name="Val Loss" />
                    </>
                  ) : (
                    <>
                      <Line type="monotone" dataKey="accuracy" stroke="#34d399" strokeWidth={2} dot={false} name="Accuracy" />
                      <Line type="monotone" dataKey="mAP50" stroke="#a78bfa" strokeWidth={2} dot={false} name="mAP@50" />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>

          {/* Confusion Matrix Heatmap */}
          <GlassPanel className="p-5">
            <h3 className="mb-5 text-lg font-semibold text-white">Confusion Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-1 text-xs text-slate-500" />
                    {d.confusion_matrix.labels.map((l) => (
                      <th key={l} className="p-1 text-center text-[10px] text-slate-400">{l.split(" ")[0]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {d.confusion_matrix.matrix.map((row, i) => (
                    <tr key={i}>
                      <td className="p-1 text-right text-[10px] text-slate-400">{d.confusion_matrix.labels[i].split(" ")[0]}</td>
                      {row.map((val, j) => (
                        <td key={j} className="p-0.5"><HeatmapCell value={val} max={240} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </div>

        {/* ── Row 4: Inference Throughput & Confidence ───────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <GlassPanel className="p-5">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white"><Activity className="h-5 w-5 text-emerald-200" /> Prediction Throughput (24h)</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={ia.throughput_timeline} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis dataKey="hour" stroke="#94a3b8" axisLine={false} tickLine={false} interval={3} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tt} />
                  <Bar dataKey="predictions" radius={[8, 8, 0, 0]} fill="#22d3ee" name="Predictions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <h3 className="mb-5 text-lg font-semibold text-white">Confidence Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={ia.confidence_distribution} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis dataKey="range" stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tt} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#a78bfa" name="Predictions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </div>

        {/* ── Row 5: Category Distribution + Error Rates ─────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          <GlassPanel className="p-5">
            <h3 className="mb-5 text-lg font-semibold text-white">Category Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip contentStyle={tt} />
                  <Pie data={ia.category_distribution} dataKey="count" nameKey="category" innerRadius={55} outerRadius={95} paddingAngle={3}>
                    {ia.category_distribution.map((e) => <Cell key={e.category} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {ia.category_distribution.map((c) => (
                <span key={c.category} className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} /> {c.category} ({c.count})
                </span>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white"><FlaskConical className="h-5 w-5 text-cyan-200" /> Error Analysis</h3>
            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">False Positive Rate</p>
                <p className="mt-1 text-3xl font-semibold text-white">{(ia.false_positives_rate * 100).toFixed(2)}%</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-rose-400" style={{ width: `${ia.false_positives_rate * 1000}%` }} /></div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">False Negative Rate</p>
                <p className="mt-1 text-3xl font-semibold text-white">{(ia.false_negatives_rate * 100).toFixed(2)}%</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-400" style={{ width: `${ia.false_negatives_rate * 1000}%` }} /></div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">Drift Detection</p>
                <p className="mt-1 text-3xl font-semibold text-white">{ia.drift_score.toFixed(4)}</p>
                <StatusBadge status={ia.drift_status} />
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white"><Network className="h-5 w-5 text-violet-200" /> API Performance</h3>
            <div className="grid gap-3">
              {d.api_performance.endpoints.map((ep) => (
                <div key={ep.path} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-semibold text-white">{ep.method} {ep.path}</code>
                    <span className="text-xs text-emerald-200">{ep.requests_today} req</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-400">
                    <span>Avg: <span className="text-white">{ep.avg_latency_ms}ms</span></span>
                    <span>P99: <span className="text-white">{ep.p99_latency_ms}ms</span></span>
                    <span>Err: <span className={ep.error_rate > 0.01 ? "text-rose-200" : "text-emerald-200"}>{(ep.error_rate * 100).toFixed(2)}%</span></span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* ── Row 6: Model Registry + Deployment History ─────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassPanel className="p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white"><Layers className="h-5 w-5 text-emerald-200" /> Model Registry</h2>
            <div className="grid gap-4">
              {d.model_versions.map((mv) => (
                <div key={mv.version_id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">{mv.model_name}</h3>
                      <p className="mt-1 text-sm text-slate-400">v{mv.version} • {mv.framework} • Dataset {mv.dataset_version}</p>
                    </div>
                    <StatusBadge status={mv.status} />
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                    <div><span className="block text-lg font-semibold text-white">{(mv.accuracy * 100).toFixed(1)}%</span><span className="text-slate-500">Accuracy</span></div>
                    <div><span className="block text-lg font-semibold text-white">{(mv.mAP50 * 100).toFixed(1)}%</span><span className="text-slate-500">mAP@50</span></div>
                    <div><span className="block text-lg font-semibold text-white">{(mv.f1_score * 100).toFixed(1)}%</span><span className="text-slate-500">F1</span></div>
                    <div><span className="block text-lg font-semibold text-white">{mv.weights_size_mb}MB</span><span className="text-slate-500">Weights</span></div>
                  </div>
                  {mv.notes ? <p className="mt-3 text-xs text-slate-500">{mv.notes}</p> : null}
                </div>
              ))}
            </div>
          </GlassPanel>

          <div className="space-y-6">
            <GlassPanel className="p-6">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white"><GitBranch className="h-5 w-5 text-cyan-200" /> Deployment History</h2>
              <div className="relative grid gap-4">
                <div className="absolute bottom-4 left-3 top-4 w-px bg-white/10" />
                {d.deployment_history.map((dep) => (
                  <div key={dep.deployment_id} className="relative flex gap-4 pl-1">
                    <span className={`mt-1 h-5 w-5 shrink-0 rounded-full border ${dep.action === "deploy" ? "border-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.4)]" : dep.action === "rollback" ? "border-amber-300" : "border-slate-500"} bg-slate-950`} />
                    <div>
                      <p className="font-medium text-white">{dep.action === "deploy" ? "Deployed" : dep.action === "rollback" ? "Rollback" : "Retired"} v{dep.version}</p>
                      <p className="mt-1 text-sm text-slate-500">{dep.deployed_by} • {new Date(dep.timestamp).toLocaleDateString()}</p>
                      {dep.notes ? <p className="mt-1 text-xs text-slate-500">{dep.notes}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white"><Database className="h-5 w-5 text-violet-200" /> Dataset Versions</h2>
              <div className="grid gap-3">
                {d.datasets.map((ds) => (
                  <div key={ds.version} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between"><span className="font-semibold text-white">{ds.version}</span>{ds.verified ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : null}</div>
                    <p className="mt-1 text-sm text-slate-400">{ds.description}</p>
                    <p className="mt-2 text-xs text-emerald-200">{ds.samples.toLocaleString()} samples • {Object.keys(ds.categories).length} categories</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* ── Row 7: Alerts & Services ───────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <GlassPanel className="p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white"><AlertTriangle className="h-5 w-5 text-amber-200" /> System Alerts</h2>
            <div className="grid gap-3">
              {d.alerts.map((alert) => (
                <div key={alert.id} className={`rounded-2xl border p-4 ${alert.severity === "warning" ? "border-amber-300/30 bg-amber-300/5" : "border-white/10 bg-white/[0.04]"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {alert.severity === "warning" ? <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-300" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />}
                      <div>
                        <p className="font-medium text-white">{alert.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{alert.message}</p>
                        <p className="mt-2 text-xs text-slate-500">{new Date(alert.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    {alert.resolved ? <span className="text-xs text-emerald-200">Resolved</span> : <span className="text-xs text-amber-200">Active</span>}
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white"><Server className="h-5 w-5 text-emerald-200" /> Service Health</h2>
            <div className="grid gap-3">
              {Object.entries(h.service_health).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <span className="font-medium capitalize text-white">{service.replace(/_/g, " ")}</span>
                  <StatusBadge status={status} />
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="mb-3 font-semibold text-white">Inference Queue</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-slate-400">Pending: <span className="text-white">{h.inference_queue.pending}</span></div>
                <div className="text-slate-400">Processing: <span className="text-white">{h.inference_queue.processing}</span></div>
                <div className="text-slate-400">Completed/hr: <span className="text-emerald-200">{h.inference_queue.completed_last_hour}</span></div>
                <div className="text-slate-400">Avg Wait: <span className="text-white">{h.inference_queue.avg_wait_ms}ms</span></div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="mb-3 font-semibold text-white">Storage Breakdown</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between text-slate-400"><span>Model Weights</span><span className="text-white">{h.storage.model_weights_gb}GB</span></div>
                <div className="flex justify-between text-slate-400"><span>Datasets</span><span className="text-white">{h.storage.datasets_gb}GB</span></div>
                <div className="flex justify-between text-slate-400"><span>Total Used</span><span className="text-white">{Math.round(h.storage.used_gb)}GB / {h.storage.total_gb}GB</span></div>
              </div>
            </div>
          </GlassPanel>
        </div>

      </section>
    </div>
  );
}
