import { useEffect, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Bot, BrainCircuit, Gamepad2, Leaf, MapPinned, Menu, Moon, QrCode, ScanLine, Sun, User, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { useThemeStore } from "../stores/themeStore";
import { Button } from "./ui";

const navItems = [
  { to: "/scanner", label: "Scanner", icon: ScanLine },
  { to: "/map", label: "Centers", icon: MapPinned },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/ai-ops", label: "AI Ops", icon: BrainCircuit },
  { to: "/circular-economy", label: "Circularity", icon: Leaf },
  { to: "/gamification", label: "Rewards", icon: Gamepad2 },
  { to: "/smart-bin", label: "Smart Bin", icon: QrCode },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { dark, toggleTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle("light", !dark);
  }, [dark]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-slate-950/55 backdrop-blur-2xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Primary">
        <NavLink to="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-emerald-300 text-slate-950 shadow-[0_0_40px_rgba(52,211,153,0.35)]">
            <Leaf className="h-5 w-5" />
            <span className="absolute inset-0 rounded-2xl border border-white/40 opacity-0 transition group-hover:opacity-100" />
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.28em] text-white">EcoVision</span>
            <span className="block text-xs text-emerald-200">AI circular OS</span>
          </span>
        </NavLink>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white",
                  isActive && "bg-white/10 text-white",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            className="rounded-full border border-white/10 bg-white/8 p-3 text-slate-200 transition hover:bg-white/14"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <NavLink to="/profile" className="rounded-full border border-white/10 bg-white/8 p-3 text-slate-200 transition hover:bg-white/14" aria-label="Profile">
            <User className="h-4 w-4" />
          </NavLink>
          <NavLink to="/login">
            <Button className="px-5 py-2.5">Launch</Button>
          </NavLink>
        </div>

        <button className="rounded-full border border-white/10 bg-white/8 p-3 text-white lg:hidden" onClick={() => setOpen((state) => !state)} aria-label="Open navigation">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="border-t border-white/10 bg-slate-950/95 px-5 py-5 lg:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-200 hover:bg-white/10">
                <item.icon className="h-4 w-4 text-emerald-200" />
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-200 hover:bg-white/10">
              <User className="h-4 w-4 text-emerald-200" />
              Profile
            </NavLink>
          </div>
        </motion.div>
      ) : null}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 px-5 py-12 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-300 text-slate-950"><Leaf className="h-5 w-5" /></span>
            <span className="text-lg font-semibold">EcoVision AI</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            AI-powered waste intelligence for campuses, cities, smart buildings, and climate-conscious teams.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-slate-400">
          <span className="font-semibold text-white">Platform</span>
          <NavLink to="/scanner" className="hover:text-white">AI Scanner</NavLink>
          <NavLink to="/analytics" className="hover:text-white">Analytics</NavLink>
          <NavLink to="/reports" className="hover:text-white">Reports</NavLink>
        </div>
        <div className="grid gap-2 text-sm text-slate-400">
          <span className="font-semibold text-white">Enterprise</span>
          <NavLink to="/map" className="hover:text-white">Recycling Network</NavLink>
          <NavLink to="/smart-bin" className="hover:text-white">Smart Bin QR</NavLink>
          <NavLink to="/login" className="hover:text-white">Secure Access</NavLink>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-500">
        <span>Copyright 2026 EcoVision AI. Mock APIs. Backend-ready architecture.</span>
        <span className="inline-flex items-center gap-2"><Bot className="h-3.5 w-3.5" /> AI assistant online</span>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="noise-layer min-h-screen overflow-hidden bg-slate-950 text-white">
      <Navigation />
      <main>{children}</main>
      <Footer />
    </div>
  );
}