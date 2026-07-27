import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
};

const buttonVariants = {
  primary:
    "bg-emerald-300 text-slate-950 shadow-[0_0_38px_rgba(52,211,153,0.32)] hover:bg-emerald-200",
  secondary: "border border-white/12 bg-white/8 text-white hover:bg-white/14",
  ghost: "text-slate-200 hover:bg-white/10",
  danger: "border border-rose-300/30 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25",
};

export function Button({ className, variant = "primary", loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80 disabled:cursor-not-allowed disabled:opacity-60",
        buttonVariants[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("glass-panel rounded-[2rem]", className)}>{children}</div>;
}

export function Section({
  children,
  className,
  eyebrow,
  title,
  description,
}: {
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <section className={cn("relative z-10 mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:py-28", className)}>
      {title ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-12 max-w-3xl"
        >
          {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">{eyebrow}</p> : null}
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h2>
          {description ? <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">{description}</p> : null}
        </motion.div>
      ) : null}
      {children}
    </section>
  );
}

export function PageHeader({
  label,
  title,
  description,
  actions,
}: {
  label: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 pb-8 pt-32 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">{label}</p>
        <h1 className="holographic-text text-4xl font-semibold tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-5 text-base leading-7 text-slate-300 sm:text-lg">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function MetricTile({
  icon,
  label,
  value,
  detail,
  className,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  detail?: string;
  className?: string;
}) {
  return (
    <GlassPanel className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p>
          {detail ? <p className="mt-2 text-sm text-emerald-200">{detail}</p> : null}
        </div>
        {icon ? <div className="rounded-2xl border border-white/10 bg-white/8 p-3 text-emerald-200">{icon}</div> : null}
      </div>
    </GlassPanel>
  );
}

export function ProgressRing({ value, size = 116, label }: { value: number; size?: number; label?: string }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#34d399" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-2xl font-semibold text-white">{value}%</span>
    </div>
  );
}

export function ConfidenceMeter({ value, label = "Confidence" }: { value: number; label?: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-emerald-200">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300"
        />
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-3xl bg-white/8", className)} />;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/60 focus:bg-white/12 focus:ring-4 focus:ring-emerald-300/10",
        className,
      )}
      {...props}
    />
  );
});

TextInput.displayName = "TextInput";