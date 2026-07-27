import { Link } from "react-router-dom";
import { Home, SearchX } from "lucide-react";
import { Button, GlassPanel } from "@/shared/components/ui";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-28">
      <GlassPanel className="max-w-xl p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-emerald-300 text-slate-950"><SearchX className="h-8 w-8" /></div>
        <h1 className="mt-6 text-4xl font-semibold text-white">Page not found</h1>
        <p className="mt-4 text-slate-400">The EcoVision AI route you requested does not exist or has moved.</p>
        <Link to="/" className="mt-6 inline-flex"><Button><Home className="h-4 w-4" /> Return home</Button></Link>
      </GlassPanel>
    </div>
  );
}