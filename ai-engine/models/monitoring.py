"""
EcoVision AI Operations Monitoring
Real-time system health, GPU/CPU telemetry, drift detection, inference queue,
prediction analytics, and alerting for the AI Ops Dashboard.
"""
import random
import time
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any


class AIMonitor:
    """Enterprise AI operations monitoring with real-time telemetry simulation."""

    def __init__(self):
        self._start_time = time.time()
        self._alerts: List[Dict[str, Any]] = []
        self._prediction_log: List[Dict[str, Any]] = []

    def get_system_health(self) -> Dict[str, Any]:
        uptime_seconds = time.time() - self._start_time
        return {
            "status": "HEALTHY",
            "uptime_seconds": round(uptime_seconds),
            "uptime_formatted": self._format_uptime(uptime_seconds),
            "gpu": self._gpu_telemetry(),
            "cpu": self._cpu_telemetry(),
            "memory": self._memory_telemetry(),
            "storage": self._storage_telemetry(),
            "inference_queue": {
                "pending": random.randint(0, 3),
                "processing": random.randint(0, 2),
                "completed_last_hour": random.randint(28, 120),
                "failed_last_hour": random.randint(0, 2),
                "avg_wait_ms": round(random.uniform(12, 85), 1),
            },
            "service_health": {
                "api_server": "UP",
                "model_server": "UP",
                "mongodb": "UP",
                "redis": "UP",
                "task_worker": "UP",
            },
            "last_checked": datetime.utcnow().isoformat(),
        }

    def get_inference_analytics(self) -> Dict[str, Any]:
        now = datetime.utcnow()
        
        # Prediction throughput timeline (last 24h, hourly)
        throughput = []
        for h in range(24):
            t = now - timedelta(hours=23 - h)
            count = random.randint(8, 65) if 6 <= t.hour <= 22 else random.randint(1, 12)
            throughput.append({
                "hour": t.strftime("%H:00"),
                "predictions": count,
                "avg_latency_ms": round(random.uniform(120, 380), 1),
            })
        
        # Confidence distribution histogram
        confidence_dist = []
        for bucket_start in range(50, 100, 5):
            count = random.randint(2, 45) if bucket_start >= 80 else random.randint(0, 8)
            confidence_dist.append({
                "range": f"{bucket_start}-{bucket_start+5}%",
                "count": count,
            })
        
        # Category distribution of recent predictions
        category_dist = [
            {"category": "Plastic", "count": random.randint(80, 160), "color": "#22d3ee"},
            {"category": "Paper", "count": random.randint(60, 130), "color": "#fde68a"},
            {"category": "Organic", "count": random.randint(50, 110), "color": "#34d399"},
            {"category": "Metal", "count": random.randint(40, 90), "color": "#a5b4fc"},
            {"category": "Glass", "count": random.randint(30, 70), "color": "#67e8f9"},
            {"category": "E-Waste", "count": random.randint(15, 50), "color": "#c084fc"},
        ]
        
        return {
            "throughput_timeline": throughput,
            "confidence_distribution": confidence_dist,
            "category_distribution": category_dist,
            "false_positives_rate": round(random.uniform(0.018, 0.042), 4),
            "false_negatives_rate": round(random.uniform(0.022, 0.055), 4),
            "total_predictions_today": sum(t["predictions"] for t in throughput),
            "avg_confidence_today": round(random.uniform(89, 96), 1),
            "drift_score": round(random.uniform(0.01, 0.08), 4),
            "drift_status": "stable" if random.random() > 0.15 else "warning",
            "retraining_status": "not_needed",
            "last_retrain": (now - timedelta(days=5)).isoformat(),
        }

    def get_api_performance(self) -> Dict[str, Any]:
        return {
            "endpoints": [
                {"path": "/predict", "method": "POST", "avg_latency_ms": round(random.uniform(180, 420), 1),
                 "p99_latency_ms": round(random.uniform(800, 1200), 1), "requests_today": random.randint(200, 800),
                 "error_rate": round(random.uniform(0.001, 0.01), 4)},
                {"path": "/predict/batch", "method": "POST", "avg_latency_ms": round(random.uniform(800, 2200), 1),
                 "p99_latency_ms": round(random.uniform(3000, 5000), 1), "requests_today": random.randint(10, 60),
                 "error_rate": round(random.uniform(0.005, 0.02), 4)},
                {"path": "/health", "method": "GET", "avg_latency_ms": round(random.uniform(2, 8), 1),
                 "p99_latency_ms": round(random.uniform(10, 25), 1), "requests_today": random.randint(500, 2000),
                 "error_rate": 0.0},
                {"path": "/models/info", "method": "GET", "avg_latency_ms": round(random.uniform(5, 15), 1),
                 "p99_latency_ms": round(random.uniform(20, 50), 1), "requests_today": random.randint(50, 200),
                 "error_rate": 0.0},
            ],
            "total_requests_today": random.randint(800, 3000),
            "total_errors_today": random.randint(0, 12),
            "avg_response_time_ms": round(random.uniform(100, 250), 1),
        }

    def get_alerts(self) -> List[Dict[str, Any]]:
        now = datetime.utcnow()
        base_alerts = [
            {"id": f"alert-{uuid.uuid4().hex[:6]}", "severity": "info", "title": "Model v2.4.0 deployed successfully",
             "message": "Production deployment completed via CI/CD pipeline.", "timestamp": (now - timedelta(days=3)).isoformat(), "resolved": True},
            {"id": f"alert-{uuid.uuid4().hex[:6]}", "severity": "warning", "title": "GPU memory usage above 80%",
             "message": "CUDA device 0 memory at 82%. Consider batch size reduction.", "timestamp": (now - timedelta(hours=6)).isoformat(), "resolved": True},
            {"id": f"alert-{uuid.uuid4().hex[:6]}", "severity": "info", "title": "Leaderboard recalculation completed",
             "message": "Hourly cron job processed 318 users.", "timestamp": (now - timedelta(hours=1)).isoformat(), "resolved": True},
        ]
        if random.random() > 0.7:
            base_alerts.insert(0, {
                "id": f"alert-{uuid.uuid4().hex[:6]}", "severity": "warning", "title": "Elevated inference latency detected",
                "message": f"Average latency {random.randint(450, 600)}ms (threshold 400ms).", "timestamp": now.isoformat(), "resolved": False,
            })
        return base_alerts

    def log_prediction(self, prediction_id: str, category: str, confidence: float, latency_ms: float):
        self._prediction_log.append({
            "prediction_id": prediction_id,
            "category": category,
            "confidence": confidence,
            "latency_ms": latency_ms,
            "timestamp": datetime.utcnow().isoformat(),
        })
        if len(self._prediction_log) > 1000:
            self._prediction_log = self._prediction_log[-500:]

    def get_prediction_log(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self._prediction_log[-limit:]

    def _gpu_telemetry(self) -> Dict[str, Any]:
        return {
            "available": True,
            "device": "NVIDIA A100 40GB (Simulated)",
            "utilization_percent": round(random.uniform(25, 75), 1),
            "memory_used_mb": random.randint(8000, 16000),
            "memory_total_mb": 40960,
            "temperature_celsius": round(random.uniform(42, 68), 1),
            "power_watts": round(random.uniform(120, 280), 1),
        }

    def _cpu_telemetry(self) -> Dict[str, Any]:
        return {
            "cores": 16,
            "utilization_percent": round(random.uniform(15, 55), 1),
            "load_average_1m": round(random.uniform(1.2, 4.8), 2),
            "load_average_5m": round(random.uniform(1.0, 3.5), 2),
        }

    def _memory_telemetry(self) -> Dict[str, Any]:
        total = 65536
        used = random.randint(18000, 38000)
        return {
            "total_mb": total,
            "used_mb": used,
            "available_mb": total - used,
            "utilization_percent": round(used / total * 100, 1),
        }

    def _storage_telemetry(self) -> Dict[str, Any]:
        total = 500
        used = round(random.uniform(120, 280), 1)
        return {
            "total_gb": total,
            "used_gb": used,
            "available_gb": round(total - used, 1),
            "utilization_percent": round(used / total * 100, 1),
            "model_weights_gb": 4.2,
            "datasets_gb": round(random.uniform(28, 45), 1),
            "prediction_cache_gb": round(random.uniform(0.5, 2.8), 1),
        }

    @staticmethod
    def _format_uptime(seconds: float) -> str:
        d = int(seconds // 86400)
        h = int((seconds % 86400) // 3600)
        m = int((seconds % 3600) // 60)
        parts = []
        if d > 0: parts.append(f"{d}d")
        if h > 0: parts.append(f"{h}h")
        parts.append(f"{m}m")
        return " ".join(parts)


ai_monitor = AIMonitor()
