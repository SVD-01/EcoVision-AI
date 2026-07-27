import { useMemo } from "react";
import { toast } from "sonner";
import { CalendarClock, Download, FileBarChart, FileText, ShieldCheck } from "lucide-react";
import { analyticsSummary, generateReportText } from "@/shared/api/mockApi";
import { Button, EmptyState, GlassPanel, MetricTile, PageHeader } from "@/shared/components/ui";
import { useEcoStore } from "@/shared/stores/ecoStore";

export default function ReportsPage() {
  const { scanHistory } = useEcoStore();
  const reports = useMemo(
    () => [
      { title: "Monthly ESG Summary", type: "Executive", date: "Jun 30, 2026" },
      { title: "Waste Distribution Audit", type: "Operations", date: "Jun 26, 2026" },
      { title: "AI Scanner Activity", type: "Model QA", date: "Jun 22, 2026" },
    ],
    [],
  );

  const download = () => {
    const body = scanHistory[0]
      ? generateReportText(scanHistory[0])
      : `EcoVision AI ESG Summary\n\nCarbon saved: ${analyticsSummary.carbonSaved} kg\nWater conserved: ${analyticsSummary.waterConserved} L\nTrees protected: ${analyticsSummary.treesProtected}\nEco Score: ${analyticsSummary.ecoScore}\n`;
    const url = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ecovision-report.txt";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  return (
    <div className="relative min-h-screen">
      <PageHeader
        label="Reports"
        title="Downloadable audit-ready sustainability reports."
        description="Mock report generation for scanner results, ESG summaries, contamination trends, AI quality snapshots, and monthly impact exports."
        actions={<Button onClick={download}><Download className="h-4 w-4" /> Download summary</Button>}
      />

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricTile icon={<ShieldCheck className="h-5 w-5" />} label="Audit Readiness" value="96%" detail="Data completeness" />
          <MetricTile icon={<FileBarChart className="h-5 w-5" />} label="Reports Generated" value="184" detail="This quarter" />
          <MetricTile icon={<CalendarClock className="h-5 w-5" />} label="Next Export" value="4 days" detail="Scheduled" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <GlassPanel className="p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">Report library</h2>
            <div className="grid gap-4">
              {reports.map((report) => (
                <button key={report.title} onClick={download} className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 text-left transition hover:bg-white/[0.08]">
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-300/15 text-emerald-200"><FileText className="h-6 w-6" /></span>
                    <span>
                      <span className="block font-semibold text-white">{report.title}</span>
                      <span className="mt-1 block text-sm text-slate-500">{report.type} | {report.date}</span>
                    </span>
                  </div>
                  <Download className="h-5 w-5 text-emerald-200" />
                </button>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">Scanner-linked reports</h2>
            {scanHistory.length ? (
              <div className="grid gap-3">
                {scanHistory.slice(0, 5).map((scan) => (
                  <button key={scan.id} onClick={download} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.08]">
                    <p className="font-medium text-white">{scan.category.label} detection</p>
                    <p className="mt-1 text-sm text-slate-500">{scan.confidence}% confidence | +{scan.impact.points} points</p>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState title="No scanner reports yet" description="Run a scan to generate item-level downloadable reports with recommendations and impact estimates." />
            )}
          </GlassPanel>
        </div>
      </section>
    </div>
  );
}