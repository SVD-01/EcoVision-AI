import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, KeyRound, Leaf, LockKeyhole, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { Button, GlassPanel, TextInput } from "@/shared/components/ui";
import { ParticleField } from "@/shared/components/effects";
import { useAuthStore } from "@/shared/stores/authStore";

type AuthMode = "login" | "register" | "otp" | "forgot" | "reset";

type AuthValues = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  otp?: string;
};

const schemas = {
  login: z.object({ email: z.string().email(), password: z.string().min(8, "Password must be at least 8 characters") }),
  register: z
    .object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8), confirm: z.string().min(8) })
    .refine((value) => value.password === value.confirm, { message: "Passwords must match", path: ["confirm"] }),
  otp: z.object({ otp: z.string().length(6, "Enter the 6 digit code") }),
  forgot: z.object({ email: z.string().email() }),
  reset: z
    .object({ password: z.string().min(8), confirm: z.string().min(8) })
    .refine((value) => value.password === value.confirm, { message: "Passwords must match", path: ["confirm"] }),
};

const copy: Record<AuthMode, { title: string; subtitle: string; icon: typeof LockKeyhole }> = {
  login: { title: "Welcome back", subtitle: "Sign in with a JWT-ready secure session interface.", icon: LockKeyhole },
  register: { title: "Create workspace", subtitle: "Register a climate operations account with validation.", icon: UserPlus },
  otp: { title: "Verify OTP", subtitle: "Enter the mock 6 digit one-time password sent to your email.", icon: ShieldCheck },
  forgot: { title: "Recover access", subtitle: "Send a reset link placeholder through the mocked auth flow.", icon: Mail },
  reset: { title: "Reset password", subtitle: "Create a new password for your JWT-ready account.", icon: KeyRound },
};

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const current = copy[mode];
  const Icon = current.icon;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthValues>({ resolver: zodResolver(schemas[mode]), defaultValues: { email: "alex@ecovision.ai", password: "password123" } });

  const submit = async (values: AuthValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 550));
    if (mode === "login" || mode === "register") {
      login(values.email ?? "alex@ecovision.ai", values.name);
      toast.success(mode === "login" ? "Signed in with mock JWT" : "Workspace created");
      navigate("/profile");
      return;
    }
    toast.success(mode === "otp" ? "OTP verified" : mode === "forgot" ? "Reset link queued" : "Password reset complete");
    navigate(mode === "otp" || mode === "reset" ? "/login" : "/reset-password");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-28 sm:px-8">
      <ParticleField count={60} />
      <div className="absolute inset-0 mesh-gradient" />
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <Link to="/" className="mb-8 inline-flex items-center gap-3 text-white">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-300 text-slate-950"><Leaf className="h-5 w-5" /></span>
            <span className="font-semibold uppercase tracking-[0.3em]">EcoVision AI</span>
          </Link>
          <h1 className="holographic-text text-5xl font-semibold tracking-tight sm:text-7xl">Secure climate intelligence.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Authentication screens are validated, animated, responsive, and designed to connect to JWT refresh-token APIs without rewriting feature UI.</p>
        </div>

        <GlassPanel className="p-6 sm:p-8">
          <div className="mb-8 flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-3xl bg-emerald-300 text-slate-950"><Icon className="h-7 w-7" /></div>
            <div>
              <h2 className="text-3xl font-semibold text-white">{current.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{current.subtitle}</p>
            </div>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit(submit)} noValidate>
            {mode === "register" ? (
              <label className="grid gap-2 text-sm text-slate-300">Name<TextInput {...register("name")} placeholder="Alex Rivera" />{errors.name ? <span className="text-rose-200">{errors.name.message}</span> : null}</label>
            ) : null}
            {(mode === "login" || mode === "register" || mode === "forgot") ? (
              <label className="grid gap-2 text-sm text-slate-300">Email<TextInput type="email" {...register("email")} placeholder="you@company.com" />{errors.email ? <span className="text-rose-200">{errors.email.message}</span> : null}</label>
            ) : null}
            {(mode === "login" || mode === "register" || mode === "reset") ? (
              <label className="grid gap-2 text-sm text-slate-300">Password<TextInput type="password" {...register("password")} placeholder="Minimum 8 characters" />{errors.password ? <span className="text-rose-200">{errors.password.message}</span> : null}</label>
            ) : null}
            {(mode === "register" || mode === "reset") ? (
              <label className="grid gap-2 text-sm text-slate-300">Confirm password<TextInput type="password" {...register("confirm")} placeholder="Repeat password" />{errors.confirm ? <span className="text-rose-200">{errors.confirm.message}</span> : null}</label>
            ) : null}
            {mode === "otp" ? (
              <label className="grid gap-2 text-sm text-slate-300">OTP code<TextInput {...register("otp")} inputMode="numeric" placeholder="123456" />{errors.otp ? <span className="text-rose-200">{errors.otp.message}</span> : null}</label>
            ) : null}

            <Button loading={isSubmitting} className="mt-2 w-full" type="submit">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
            {mode !== "login" ? <Link to="/login" className="hover:text-white">Login</Link> : <Link to="/forgot-password" className="hover:text-white">Forgot password?</Link>}
            {mode !== "register" ? <Link to="/register" className="hover:text-white">Create account</Link> : null}
            <Link to="/verify-otp" className="hover:text-white">OTP verification</Link>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}