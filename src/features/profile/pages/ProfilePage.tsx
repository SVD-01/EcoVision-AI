import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Bell, Camera, Download, FileText, History, Mail, MapPin, ShieldCheck, SlidersHorizontal, Trophy, Upload, UserRound } from "lucide-react";
import { generateReportText } from "@/shared/api/mockApi";
import { Button, EmptyState, GlassPanel, MetricTile, PageHeader, TextInput } from "@/shared/components/ui";
import { useAuthStore } from "@/shared/stores/authStore";
import { useEcoStore } from "@/shared/stores/ecoStore";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { scanHistory } = useEcoStore();
  const [name, setName] = useState(user.name);
  const [city, setCity] = useState(user.city);
  const [preferences, setPreferences] = useState({ scans: true, challenges: true, reports: false, voice: true });

  const totals = useMemo(
    () =>
      scanHistory.reduce(
        (acc, scan) => ({
          carbon: acc.carbon + scan.impact.carbonKg,
          water: acc.water + scan.impact.waterLiters,
          points: acc.points + scan.impact.points,
        }),
        { carbon: 438.7, water: 12840, points: 12840 },
      ),
    [scanHistory],
  );

  const avatarUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateUser({ avatar: String(reader.result) });
    reader.readAsDataURL(file);
    toast.success("Avatar updated locally");
  };

  const saveProfile = () => {
    updateUser({ name, city });
    toast.success("Profile preferences saved");
  };

  const downloadFirstReport = () => {
    const scan = scanHistory[0];
    if (!scan) {
      toast.error("Scan history is empty. Run a scan first.");
      return;
    }
    const url = URL.createObjectURL(new Blob([generateReportText(scan)], { type: "text/plain" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${scan.id}-profile-report.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-screen">
      <PageHeader
        label="User profile"
        title="Your sustainability identity and operating history."
        description="Avatar upload, achievements, scan history, downloadable reports, sustainability metrics, settings, and notification preferences."
        actions={<Button variant="secondary" onClick={downloadFirstReport}><Download className="h-4 w-4" /> Latest report</Button>}
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-20 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <GlassPanel className="p-6 text-center">
            <div className="relative mx-auto h-32 w-32">
              {user.avatar ? <img src={user.avatar} alt="User avatar" className="h-full w-full rounded-[2rem] object-cover" /> : <div className="grid h-full w-full place-items-center rounded-[2rem] bg-gradient-to-br from-emerald-300 to-cyan-300 text-slate-950"><UserRound className="h-16 w-16" /></div>}
              <label className="absolute -bottom-3 -right-3 grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-slate-950 text-emerald-200 shadow-[0_0_28px_rgba(52,211,153,0.3)]">
                <Camera className="h-5 w-5" />
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => avatarUpload(event.target.files?.[0])} />
              </label>
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-white">{user.name}</h2>
            <p className="mt-1 text-slate-400">{user.role}</p>
            <div className="mt-5 grid gap-2 text-sm text-slate-300">
              <span className="inline-flex items-center justify-center gap-2"><Mail className="h-4 w-4 text-emerald-200" /> {user.email}</span>
              <span className="inline-flex items-center justify-center gap-2"><MapPin className="h-4 w-4 text-emerald-200" /> {user.city}</span>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white"><Trophy className="h-5 w-5 text-amber-200" /> Featured achievements</h2>
            <div className="grid gap-3">
              {["Zero Waste Pilot", "Carbon Guardian", "21 Day Streak"].map((badge) => (
                <div key={badge} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <ShieldCheck className="h-5 w-5 text-emerald-200" />
                  <span className="font-medium text-white">{badge}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricTile label="Carbon Saved" value={`${totals.carbon.toFixed(1)} kg`} detail="CO2 equivalent" />
            <MetricTile label="Water Conserved" value={`${Math.round(totals.water).toLocaleString()} L`} detail="lifetime" />
            <MetricTile label="Eco Points" value={Math.round(totals.points).toLocaleString()} detail="available" />
          </div>

          <GlassPanel className="p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white"><SlidersHorizontal className="h-5 w-5 text-emerald-200" /> Profile settings</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">Full name<TextInput value={name} onChange={(event) => setName(event.target.value)} /></label>
              <label className="grid gap-2 text-sm text-slate-300">City<TextInput value={city} onChange={(event) => setCity(event.target.value)} /></label>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {Object.entries(preferences).map(([key, value]) => (
                <button key={key} onClick={() => setPreferences((current) => ({ ...current, [key]: !value }))} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left">
                  <span className="capitalize text-white">{key} notifications</span>
                  <span className={`h-7 w-12 rounded-full p-1 transition ${value ? "bg-emerald-300" : "bg-white/12"}`}><span className={`block h-5 w-5 rounded-full bg-slate-950 transition ${value ? "translate-x-5" : "translate-x-0"}`} /></span>
                </button>
              ))}
            </div>
            <Button className="mt-6" onClick={saveProfile}><Upload className="h-4 w-4" /> Save profile</Button>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-white"><History className="h-5 w-5 text-emerald-200" /> Scan history</h2>
              <Bell className="h-5 w-5 text-slate-400" />
            </div>
            {scanHistory.length ? (
              <div className="grid gap-3">
                {scanHistory.slice(0, 6).map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div>
                      <p className="font-medium text-white">{scan.category.label}</p>
                      <p className="mt-1 text-sm text-slate-500">{new Date(scan.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right text-sm text-emerald-200">+{scan.impact.points} pts</div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No local scans yet" description="Run the AI Scanner to populate profile history and downloadable reports." />
            )}
          </GlassPanel>

          <GlassPanel className="p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white"><FileText className="h-5 w-5 text-emerald-200" /> Reports</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Monthly ESG", "Contamination", "Impact summary"].map((report) => (
                <button key={report} onClick={downloadFirstReport} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-sm text-white transition hover:bg-white/[0.08]">
                  <FileText className="mb-3 h-5 w-5 text-emerald-200" />
                  {report}
                </button>
              ))}
            </div>
          </GlassPanel>
        </div>
      </section>
    </div>
  );
}