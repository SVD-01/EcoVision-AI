import { useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Webcam from "react-webcam";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Camera, Download, FileImage, History, ImagePlus, RefreshCcw, ScanLine, Sparkles, Trash2, UploadCloud } from "lucide-react";
import { fetchScanHistory, generateReportText, scanWaste } from "@/shared/api/mockApi";
import type { ScanResult } from "@/shared/api/types";
import { Button, ConfidenceMeter, EmptyState, GlassPanel, MetricTile, PageHeader, Skeleton } from "@/shared/components/ui";
import { useEcoStore } from "@/shared/stores/ecoStore";

function downloadReport(scan: ScanResult) {
  const blob = new Blob([generateReportText(scan)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${scan.id}-report.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function BoundingBoxes({ scan }: { scan: ScanResult }) {
  return (
    <>
      {scan.boundingBoxes.map((box) => (
        <motion.div
          key={`${box.label}-${box.x}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute rounded-2xl border-2 border-emerald-300 shadow-[0_0_28px_rgba(52,211,153,0.5)]"
          style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.width}%`, height: `${box.height}%` }}
        >
          <span className="absolute -top-9 left-0 whitespace-nowrap rounded-full bg-emerald-300 px-3 py-1 text-xs font-semibold text-slate-950">
            {box.label} {box.confidence}%
          </span>
        </motion.div>
      ))}
    </>
  );
}

export default function ScannerPage() {
  const webcamRef = useRef<Webcam>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const { scanHistory, addScan, clearHistory } = useEcoStore();
  const mockHistory = useQuery({ queryKey: ["scan-history"], queryFn: fetchScanHistory });

  const mutation = useMutation({
    mutationFn: (name: string) => scanWaste(name),
    onSuccess: (scan) => {
      setResult(scan);
      addScan(scan);
      toast.success(`Detected ${scan.category.label} with ${scan.confidence}% confidence`);
    },
  });

  const history = useMemo(() => (scanHistory.length ? scanHistory : mockHistory.data ?? []), [mockHistory.data, scanHistory]);

  const onDrop = (accepted: File[]) => {
    const acceptedFile = accepted[0];
    if (!acceptedFile) return;
    setFile(acceptedFile);
    setPreview(URL.createObjectURL(acceptedFile));
    setResult(null);
  };

  const dropzone = useDropzone({ onDrop, accept: { "image/*": [] }, multiple: false, maxSize: 8 * 1024 * 1024 });

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const captureCamera = () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) {
      toast.error("Camera frame unavailable. Check browser permissions.");
      return;
    }
    setPreview(screenshot);
    setFile(null);
    setResult(null);
    mutation.mutate("live-camera-frame.jpg");
  };

  const runScan = () => {
    if (!file && !preview) {
      toast.error("Upload an image or capture a camera frame first.");
      return;
    }
    mutation.mutate(file?.name ?? "captured-frame.jpg");
  };

  return (
    <div className="relative min-h-screen">
      <PageHeader
        label="AI Scanner"
        title="Detect, explain, and route waste in seconds."
        description="Drag-and-drop uploads, webcam capture, animated scanning overlays, bounding boxes, confidence meters, recommendations, reports, and persistent mock history."
        actions={<Button onClick={() => setCameraOpen((state) => !state)} variant="secondary"><Camera className="h-4 w-4" /> {cameraOpen ? "Hide camera" : "Live camera"}</Button>}
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <GlassPanel className="p-5">
            <div
              {...dropzone.getRootProps()}
              className={`relative flex min-h-[340px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-dashed p-6 text-center transition ${dropzone.isDragActive ? "border-emerald-300 bg-emerald-300/10" : "border-white/15 bg-white/[0.03] hover:bg-white/[0.06]"}`}
            >
              <input {...dropzone.getInputProps()} aria-label="Upload waste image" />
              {preview ? (
                <>
                  <img src={preview} alt="Waste preview" className="absolute inset-0 h-full w-full object-cover opacity-72" />
                  <div className="absolute inset-0 bg-slate-950/35" />
                  {mutation.isPending ? <div className="scanner-line absolute left-0 top-0 h-32 w-full" /> : null}
                  {result ? <BoundingBoxes scan={result} /> : null}
                  <div className="relative z-10 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white backdrop-blur-xl">
                    {file?.name ?? "Captured camera frame"}
                  </div>
                </>
              ) : (
                <div className="relative z-10 max-w-md">
                  <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-emerald-300 text-slate-950 shadow-[0_0_38px_rgba(52,211,153,0.35)]">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Drop a waste image</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">PNG, JPG, HEIC, and mobile photos up to 8 MB. The mocked AI service returns enterprise-style predictions.</p>
                </div>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={runScan} loading={mutation.isPending}><ScanLine className="h-4 w-4" /> Run AI scan</Button>
              <Button variant="secondary" onClick={() => { setFile(null); setPreview(null); setResult(null); }}><RefreshCcw className="h-4 w-4" /> Reset</Button>
              {result ? <Button variant="secondary" onClick={() => downloadReport(result)}><Download className="h-4 w-4" /> Report</Button> : null}
            </div>
          </GlassPanel>

          {cameraOpen ? (
            <GlassPanel className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-white">Live camera detection</h2>
                <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">Browser permission required</span>
              </div>
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900">
                <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="h-[320px] w-full object-cover" videoConstraints={{ facingMode: "environment" }} />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-20 scanner-line" />
              </div>
              <Button className="mt-5" onClick={captureCamera} loading={mutation.isPending}><Camera className="h-4 w-4" /> Capture and scan</Button>
            </GlassPanel>
          ) : null}
        </div>

        <div className="space-y-6">
          {mutation.isPending ? (
            <GlassPanel className="space-y-4 p-6">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-24" />
              <Skeleton className="h-32" />
            </GlassPanel>
          ) : result ? (
            <GlassPanel className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Prediction</p>
                  <h2 className="mt-2 text-4xl font-semibold text-white">{result.category.label}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{result.category.description}</p>
                </div>
                <Sparkles className="h-7 w-7 text-emerald-200" />
              </div>
              <div className="mt-6"><ConfidenceMeter value={result.confidence} /></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MetricTile label="Carbon" value={`${result.impact.carbonKg} kg`} detail="avoided" />
                <MetricTile label="Water" value={`${result.impact.waterLiters} L`} detail="conserved" />
                <MetricTile label="Points" value={`+${result.impact.points}`} detail="earned" />
              </div>
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                <h3 className="font-semibold text-white">Disposal recommendations</h3>
                <div className="mt-4 grid gap-3">
                  {result.recommendations.map((item) => (
                    <div key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-emerald-100">{result.category.impact}</p>
            </GlassPanel>
          ) : (
            <EmptyState title="No scan result yet" description="Upload an image or capture the live camera stream to generate a mocked AI prediction with bounding boxes and impact estimates." action={<Button onClick={runScan} variant="secondary"><ImagePlus className="h-4 w-4" /> Prepare scanner</Button>} />
          )}

          <GlassPanel className="p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-white"><History className="h-5 w-5 text-emerald-200" /> Scan history</h2>
              {scanHistory.length ? <button onClick={clearHistory} className="text-sm text-rose-200 hover:text-rose-100"><Trash2 className="mr-1 inline h-4 w-4" />Clear</button> : null}
            </div>
            {mockHistory.isLoading && !history.length ? <Skeleton className="h-36" /> : null}
            <div className="grid gap-3">
              {history.slice(0, 6).map((scan) => (
                <button key={scan.id} onClick={() => setResult(scan)} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.08]">
                  <span className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/8 text-emerald-200"><FileImage className="h-5 w-5" /></span>
                    <span>
                      <span className="block font-medium text-white">{scan.category.label}</span>
                      <span className="block text-xs text-slate-500">{new Date(scan.createdAt).toLocaleString()}</span>
                    </span>
                  </span>
                  <span className="text-sm text-emerald-200">{scan.confidence}%</span>
                </button>
              ))}
            </div>
          </GlassPanel>
        </div>
      </section>
    </div>
  );
}