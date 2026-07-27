/**
 * EcoVision AI Engine API Client
 * Communicates with the Python FastAPI AI microservice.
 * Falls back to realistic local simulation when the AI engine is offline.
 */

const AI_ENGINE_URL = import.meta.env.VITE_AI_ENGINE_URL || "http://localhost:8000";
const API_PREFIX = "/api/v1";

const latency = (min = 300, max = 900) =>
  new Promise<void>((r) => setTimeout(r, Math.floor(Math.random() * (max - min)) + min));

const rand = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Types ──────────────────────────────────────────────────────────────────

export type SystemHealth = {
  status: string;
  uptime_formatted: string;
  gpu: { utilization_percent: number; memory_used_mb: number; memory_total_mb: number; temperature_celsius: number; device: string };
  cpu: { utilization_percent: number; cores: number; load_average_1m: number };
  memory: { used_mb: number; total_mb: number; utilization_percent: number };
  storage: { used_gb: number; total_gb: number; model_weights_gb: number; datasets_gb: number };
  inference_queue: { pending: number; processing: number; completed_last_hour: number; avg_wait_ms: number };
  service_health: Record<string, string>;
};

export type TrainingEpoch = {
  epoch: number;
  train_loss: number;
  val_loss: number;
  accuracy: number;
  mAP50: number;
  learning_rate: number;
};

export type ConfusionMatrixData = {
  matrix: number[][];
  labels: string[];
};

export type ModelVersion = {
  version_id: string;
  model_name: string;
  version: string;
  framework: string;
  accuracy: number;
  mAP50: number;
  f1_score: number;
  parameters_count: number;
  weights_size_mb: number;
  status: string;
  deployed_at?: string;
  dataset_version: string;
  notes: string;
};

export type DeploymentRecord = {
  deployment_id: string;
  model_name: string;
  version: string;
  action: string;
  status: string;
  timestamp: string;
  deployed_by: string;
  notes: string;
};

export type AIAlert = {
  id: string;
  severity: string;
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
};

export type InferenceAnalytics = {
  throughput_timeline: Array<{ hour: string; predictions: number; avg_latency_ms: number }>;
  confidence_distribution: Array<{ range: string; count: number }>;
  category_distribution: Array<{ category: string; count: number; color: string }>;
  false_positives_rate: number;
  false_negatives_rate: number;
  total_predictions_today: number;
  avg_confidence_today: number;
  drift_score: number;
  drift_status: string;
  retraining_status: string;
};

export type AIOpsDashboard = {
  system_health: SystemHealth;
  inference_analytics: InferenceAnalytics;
  api_performance: { endpoints: Array<{ path: string; method: string; avg_latency_ms: number; p99_latency_ms: number; requests_today: number; error_rate: number }>; total_requests_today: number };
  alerts: AIAlert[];
  active_model: { name: string; version: string; accuracy: number; mAP50: number; f1_score: number; framework: string; deployed_at?: string };
  model_info: { metrics: Record<string, number>; parameters_count: number; flops_giga: number; weights_size_mb: number };
  training_history: TrainingEpoch[];
  confusion_matrix: ConfusionMatrixData;
  model_versions: ModelVersion[];
  deployment_history: DeploymentRecord[];
  datasets: Array<{ version: string; description: string; samples: number; categories: Record<string, number>; verified: boolean }>;
};

// ─── Fetch wrapper ──────────────────────────────────────────────────────────

async function aiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${AI_ENGINE_URL}${API_PREFIX}${path}`, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

// ─── Training history generator ─────────────────────────────────────────────

function genTrainingHistory(): TrainingEpoch[] {
  const h: TrainingEpoch[] = [];
  for (let e = 1; e <= 100; e++) {
    const p = e / 100;
    h.push({
      epoch: e,
      train_loss: Math.round(Math.max(0.05, 2.8 * Math.exp(-3.5 * p) + 0.12 + (Math.random() - 0.5) * 0.03) * 10000) / 10000,
      val_loss: Math.round(Math.max(0.08, 2.9 * Math.exp(-3.2 * p) + 0.15 + (Math.random() - 0.5) * 0.04) * 10000) / 10000,
      accuracy: Math.round(Math.min(0.98, 0.45 + 0.5 * (1 - Math.exp(-4 * p)) + (Math.random() - 0.5) * 0.016) * 10000) / 10000,
      mAP50: Math.round(Math.min(0.97, 0.35 + 0.58 * (1 - Math.exp(-3.8 * p)) + (Math.random() - 0.5) * 0.02) * 10000) / 10000,
      learning_rate: Math.round(Math.max(1e-6, 0.001 * Math.cos(Math.PI * p * 0.5)) * 1000000) / 1000000,
    });
  }
  return h;
}

function genConfusionMatrix(): ConfusionMatrixData {
  const labels = ["Plastic", "Paper", "Organic", "Metal", "Glass", "E-Waste"];
  const matrix = labels.map((_, i) => labels.map((_, j) => (i === j ? randInt(185, 238) : randInt(1, 11))));
  return { matrix, labels };
}

// ─── Simulation fallback ────────────────────────────────────────────────────

function simulateDashboard(): AIOpsDashboard {
  const throughput = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    predictions: i >= 6 && i <= 22 ? randInt(12, 62) : randInt(1, 10),
    avg_latency_ms: rand(120, 380),
  }));
  const confDist = [50,55,60,65,70,75,80,85,90,95].map((s) => ({
    range: `${s}-${s + 5}%`,
    count: s >= 80 ? randInt(8, 48) : randInt(0, 8),
  }));
  const catDist = [
    { category: "Plastic", count: randInt(80, 160), color: "#22d3ee" },
    { category: "Paper", count: randInt(60, 130), color: "#fde68a" },
    { category: "Organic", count: randInt(50, 110), color: "#34d399" },
    { category: "Metal", count: randInt(40, 90), color: "#a5b4fc" },
    { category: "Glass", count: randInt(30, 70), color: "#67e8f9" },
    { category: "E-Waste", count: randInt(15, 50), color: "#c084fc" },
  ];

  return {
    system_health: {
      status: "HEALTHY",
      uptime_formatted: `${randInt(2, 14)}d ${randInt(1, 23)}h ${randInt(1, 59)}m`,
      gpu: { utilization_percent: rand(25, 72), memory_used_mb: randInt(8000, 16000), memory_total_mb: 40960, temperature_celsius: rand(42, 66), device: "NVIDIA A100 40GB" },
      cpu: { utilization_percent: rand(15, 52), cores: 16, load_average_1m: rand(1.2, 4.6) },
      memory: { used_mb: randInt(18000, 36000), total_mb: 65536, utilization_percent: rand(28, 55) },
      storage: { used_gb: rand(120, 260), total_gb: 500, model_weights_gb: 4.2, datasets_gb: rand(28, 42) },
      inference_queue: { pending: randInt(0, 3), processing: randInt(0, 2), completed_last_hour: randInt(32, 115), avg_wait_ms: rand(14, 78) },
      service_health: { api_server: "UP", model_server: "UP", mongodb: "UP", redis: "UP", task_worker: "UP" },
    },
    inference_analytics: {
      throughput_timeline: throughput,
      confidence_distribution: confDist,
      category_distribution: catDist,
      false_positives_rate: rand(0.018, 0.042),
      false_negatives_rate: rand(0.022, 0.055),
      total_predictions_today: throughput.reduce((s, t) => s + t.predictions, 0),
      avg_confidence_today: rand(89, 96),
      drift_score: rand(0.01, 0.07),
      drift_status: Math.random() > 0.15 ? "stable" : "warning",
      retraining_status: "not_needed",
    },
    api_performance: {
      endpoints: [
        { path: "/predict", method: "POST", avg_latency_ms: rand(180, 420), p99_latency_ms: rand(800, 1200), requests_today: randInt(200, 800), error_rate: rand(0.001, 0.01) },
        { path: "/predict/batch", method: "POST", avg_latency_ms: rand(800, 2200), p99_latency_ms: rand(3000, 5000), requests_today: randInt(10, 60), error_rate: rand(0.005, 0.02) },
        { path: "/health", method: "GET", avg_latency_ms: rand(2, 8), p99_latency_ms: rand(10, 25), requests_today: randInt(500, 2000), error_rate: 0 },
      ],
      total_requests_today: randInt(800, 3000),
    },
    alerts: [
      { id: "a1", severity: "info", title: "Model v2.4.0 deployed", message: "CI/CD deployment completed.", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), resolved: true },
      { id: "a2", severity: "warning", title: "GPU memory above 80%", message: "CUDA device 0 at 82%.", timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), resolved: true },
      { id: "a3", severity: "info", title: "Leaderboard recalculation completed", message: "318 users processed.", timestamp: new Date(Date.now() - 3600000).toISOString(), resolved: true },
    ],
    active_model: { name: "ecovision-yolov8-waste-v2", version: "2.4.0", accuracy: 0.942, mAP50: 0.951, f1_score: 0.936, framework: "YOLOv8+PyTorch", deployed_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    model_info: { metrics: { accuracy: 0.942, precision: 0.938, recall: 0.935, f1_score: 0.936, mAP50: 0.951, mAP50_95: 0.887, total_predictions: randInt(2400, 8600), avg_inference_ms: rand(180, 320), avg_confidence: rand(90, 95) }, parameters_count: 85400000, flops_giga: 28.6, weights_size_mb: 163.2 },
    training_history: genTrainingHistory(),
    confusion_matrix: genConfusionMatrix(),
    model_versions: [
      { version_id: "mv-001", model_name: "ecovision-yolov8-waste-v2", version: "2.4.0", framework: "YOLOv8+PyTorch", accuracy: 0.942, mAP50: 0.951, f1_score: 0.936, parameters_count: 85400000, weights_size_mb: 163.2, status: "active", deployed_at: new Date(Date.now() - 3 * 86400000).toISOString(), dataset_version: "v3.2.0", notes: "Production model" },
      { version_id: "mv-002", model_name: "ecovision-yolov8-waste-v2", version: "2.3.1", framework: "YOLOv8+PyTorch", accuracy: 0.928, mAP50: 0.939, f1_score: 0.924, parameters_count: 85400000, weights_size_mb: 163.0, status: "archived", deployed_at: new Date(Date.now() - 18 * 86400000).toISOString(), dataset_version: "v3.1.0", notes: "Previous production" },
      { version_id: "mv-003", model_name: "ecovision-efficientdet-lite", version: "1.2.0", framework: "TensorFlow/TFLite", accuracy: 0.891, mAP50: 0.904, f1_score: 0.888, parameters_count: 12800000, weights_size_mb: 48.5, status: "staging", dataset_version: "v3.2.0", notes: "Edge/IoT model" },
      { version_id: "mv-004", model_name: "ecovision-resnet50-classifier", version: "3.0.0", framework: "PyTorch/ONNX", accuracy: 0.918, mAP50: 0, f1_score: 0.912, parameters_count: 25600000, weights_size_mb: 97.8, status: "archived", dataset_version: "v2.8.0", notes: "Classification only" },
    ],
    deployment_history: [
      { deployment_id: "dep-a1", model_name: "ecovision-yolov8-waste-v2", version: "2.4.0", action: "deploy", status: "success", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), deployed_by: "CI/CD Pipeline", notes: "Automated deployment" },
      { deployment_id: "dep-a2", model_name: "ecovision-yolov8-waste-v2", version: "2.3.1", action: "retire", status: "success", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), deployed_by: "CI/CD Pipeline", notes: "Superseded by v2.4.0" },
      { deployment_id: "dep-a3", model_name: "ecovision-yolov8-waste-v2", version: "2.3.1", action: "deploy", status: "success", timestamp: new Date(Date.now() - 18 * 86400000).toISOString(), deployed_by: "Admin: Maya Chen", notes: "" },
    ],
    datasets: [
      { version: "v3.2.0", description: "Full 6-class with augmentations", samples: 48500, categories: { plastic: 9200, paper: 8100, organic: 7800, metal: 8400, glass: 7500, "e-waste": 7500 }, verified: true },
      { version: "v3.1.0", description: "Expanded with edge-cases", samples: 42000, categories: { plastic: 8000, paper: 7200, organic: 6800, metal: 7000, glass: 6500, "e-waste": 6500 }, verified: true },
      { version: "v2.8.0", description: "Original multi-source", samples: 35000, categories: { plastic: 6800, paper: 6200, organic: 5500, metal: 5800, glass: 5200, "e-waste": 5500 }, verified: true },
    ],
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function fetchAIOpsDashboard(): Promise<AIOpsDashboard> {
  await latency(200, 500);
  const live = await aiFetch<AIOpsDashboard>("/monitoring/dashboard-summary");
  if (live) return live;
  return simulateDashboard();
}
