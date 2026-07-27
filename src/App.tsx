import { lazy, Suspense, useEffect, useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import AiAssistant from "@/features/assistant/components/AiAssistant";
import { CursorGlow, SmoothScrollProvider } from "@/shared/components/effects";
import { AppShell } from "@/shared/components/layout";
import { GlassPanel, Skeleton } from "@/shared/components/ui";

const LandingPage = lazy(() => import("@/features/landing/pages/LandingPage"));
const ScannerPage = lazy(() => import("@/features/scanner/pages/ScannerPage"));
const RecyclingMapPage = lazy(() => import("@/features/maps/pages/RecyclingMapPage"));
const CircularEducationPage = lazy(() => import("@/features/circular/pages/CircularEducationPage"));
const AnalyticsDashboard = lazy(() => import("@/features/analytics/pages/AnalyticsDashboard"));
const GamificationPage = lazy(() => import("@/features/gamification/pages/GamificationPage"));
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"));
const AuthPage = lazy(() => import("@/features/auth/pages/AuthPages"));
const SmartBinPage = lazy(() => import("@/features/smart-bin/pages/SmartBinPage"));
const ReportsPage = lazy(() => import("@/features/reports/pages/ReportsPage"));
const AIOpsPage = lazy(() => import("@/features/ai-ops/pages/AIOpsPage"));
const NotFoundPage = lazy(() => import("@/features/errors/NotFoundPage"));

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return null;
}

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-28">
      <GlassPanel className="w-full max-w-3xl p-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="mt-5 h-28" />
        <Skeleton className="mt-5 h-48" />
      </GlassPanel>
    </div>
  );
}

function AppRoutes() {
  return (
    <AppShell>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/map" element={<RecyclingMapPage />} />
          <Route path="/circular-economy" element={<CircularEducationPage />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/gamification" element={<GamificationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/smart-bin" element={<SmartBinPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/ai-ops" element={<AIOpsPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/verify-otp" element={<AuthPage mode="otp" />} />
          <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
          <Route path="/reset-password" element={<AuthPage mode="reset" />} />
          <Route path="/dashboard" element={<Navigate to="/analytics" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <AiAssistant />
    </AppShell>
  );
}

export default function App() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <SmoothScrollProvider>
            <CursorGlow />
            <AppRoutes />
            <Toaster richColors position="top-right" toastOptions={{ style: { background: "#020617", color: "#f8fafc", border: "1px solid rgba(255,255,255,0.12)" } }} />
          </SmoothScrollProvider>
        </BrowserRouter>
      </MotionConfig>
    </QueryClientProvider>
  );
}
