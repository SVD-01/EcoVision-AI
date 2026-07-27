import { useState } from "react";
import { motion } from "framer-motion";
import { BatteryCharging, CheckCircle2, Cpu, Leaf, QrCode, Radio, Recycle, ScanLine, Trash2 } from "lucide-react";
import { Button, GlassPanel, MetricTile, PageHeader, ProgressRing } from "@/shared/components/ui";

const bins = [
  { name: "Organics", fill: 64, icon: Leaf, status: "Compost stream healthy" },
  { name: "Recycling", fill: 42, icon: Recycle, status: "2 contamination alerts" },
  { name: "E-Waste", fill: 18, icon: BatteryCharging, status: "Pickup due Friday" },
];

export default function SmartBinPage() {
  const [paired, setPaired] = useState(false);

  return (
    <div className="relative min-h-screen">
      <PageHeader
        label="Smart Bin QR"
        title="Connect physical bins to the circular economy graph."
        description="QR pairing, live fill-level placeholders, device telemetry, accepted waste streams, and scanner handoff for smart campuses and buildings."
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="relative mx-auto max-w-sm text-center">
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-3xl bg-emerald-300 text-slate-950"><QrCode className="h-8 w-8" /></div>
            <h2 className="text-3xl font-semibold text-white">Bin QR pairing</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Scan this generated QR with a facility device to attach bin events to EcoVision AI.</p>
            <motion.div animate={{ boxShadow: paired ? "0 0 58px rgba(52,211,153,0.5)" : "0 0 22px rgba(34,211,238,0.2)" }} className="qr-grid mx-auto mt-8 h-64 w-64 rounded-[2rem] border-[12px] border-white bg-white p-4" />
            <Button className="mt-8" onClick={() => setPaired((state) => !state)}><Radio className="h-4 w-4" /> {paired ? "Device paired" : "Simulate pairing"}</Button>
          </div>
        </GlassPanel>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricTile label="Connected Bins" value="42" detail="Across 8 floors" />
            <MetricTile label="Events Today" value="1,284" detail="Edge telemetry" />
            <MetricTile label="Alerts" value="7" detail="Need action" />
          </div>

          <GlassPanel className="p-6">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-white"><Cpu className="h-5 w-5 text-emerald-200" /> Live bin status</h2>
            <div className="grid gap-4">
              {bins.map((bin) => (
                <div key={bin.name} className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/8 text-emerald-200"><bin.icon className="h-6 w-6" /></div>
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold text-white">{bin.name}</h3>
                      <span className="text-sm text-emerald-200">{bin.fill}% full</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${bin.fill}%` }} /></div>
                    <p className="mt-2 text-sm text-slate-400">{bin.status}</p>
                  </div>
                  <ProgressRing value={bin.fill} size={82} />
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white"><ScanLine className="h-5 w-5 text-emerald-200" /> Latest smart-bin events</h2>
            <div className="grid gap-3">
              {["Bottle accepted in Floor 4 recycling", "Food scraps routed to compost", "Battery rejected from mixed recycling", "Pickup threshold reached in cafeteria"].map((event, index) => (
                <div key={event} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
                  {index === 2 ? <Trash2 className="h-5 w-5 text-rose-200" /> : <CheckCircle2 className="h-5 w-5 text-emerald-200" />}
                  {event}
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </section>
    </div>
  );
}