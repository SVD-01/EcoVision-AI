"""
EcoVision AI Engine - FastAPI REST API Routes
Provides prediction, batch inference, model management, monitoring, and ops dashboard endpoints.
"""
import uuid
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, Header
from pydantic import BaseModel, Field

from config.settings import settings, WASTE_CATEGORIES
from models.inference_engine import detection_engine
from models.model_registry import model_registry
from models.monitoring import ai_monitor


# ─── Pydantic Schemas ────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    filename: str = "uploaded_image.jpg"
    source: str = "upload"
    lat: Optional[float] = None
    lng: Optional[float] = None

class BatchPredictRequest(BaseModel):
    items: List[PredictRequest]

class RollbackRequest(BaseModel):
    version_id: str

class APIResponse(BaseModel):
    success: bool = True
    message: str = ""
    data: dict = {}


# ─── Routers ─────────────────────────────────────────────────────────────────

predict_router = APIRouter(prefix="/predict", tags=["Prediction"])
model_router = APIRouter(prefix="/models", tags=["Model Management"])
monitoring_router = APIRouter(prefix="/monitoring", tags=["AI Ops Monitoring"])
dataset_router = APIRouter(prefix="/datasets", tags=["Dataset Management"])
health_router = APIRouter(tags=["Health"])


# ─── Authentication Helper ───────────────────────────────────────────────────

def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """Verify API key for service-to-service communication."""
    if x_api_key and x_api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


# ─── Prediction Endpoints ────────────────────────────────────────────────────

@predict_router.post("/image", summary="Single Image AI Prediction")
async def predict_image(
    image: UploadFile = File(...),
    source: str = Form("upload"),
):
    """
    Upload an image for AI-powered waste classification and detection.
    Returns category, confidence, bounding boxes, recommendations, and impact.
    """
    contents = await image.read()
    result = detection_engine.predict(image_bytes=contents, filename=image.filename or "upload.jpg")
    
    ai_monitor.log_prediction(result.prediction_id, result.category_id, result.confidence, result.inference_time_ms)
    
    return {
        "success": True,
        "message": f"Detected {result.category_label} with {result.confidence}% confidence",
        "data": result.to_dict(),
    }


@predict_router.post("/analyze", summary="Analyze by filename (mock/test)")
async def predict_by_filename(req: PredictRequest):
    """Analyze waste from filename inference (for testing and frontend mock integration)."""
    result = detection_engine.predict(filename=req.filename)
    ai_monitor.log_prediction(result.prediction_id, result.category_id, result.confidence, result.inference_time_ms)
    
    return {
        "success": True,
        "message": f"Detected {result.category_label} with {result.confidence}% confidence",
        "data": result.to_dict(),
    }


@predict_router.post("/batch", summary="Batch Prediction")
async def predict_batch(req: BatchPredictRequest):
    """Process multiple images in a single batch inference call."""
    items = [{"filename": item.filename} for item in req.items]
    results = detection_engine.predict_batch(items)
    
    for r in results:
        ai_monitor.log_prediction(r.prediction_id, r.category_id, r.confidence, r.inference_time_ms)
    
    return {
        "success": True,
        "message": f"Processed {len(results)} predictions",
        "data": {"predictions": [r.to_dict() for r in results], "count": len(results)},
    }


@predict_router.get("/history", summary="Prediction History")
async def get_prediction_history(limit: int = Query(50, le=200)):
    """Get recent prediction log from the AI engine."""
    logs = ai_monitor.get_prediction_log(limit)
    return {"success": True, "data": {"predictions": logs, "count": len(logs)}}


@predict_router.get("/categories", summary="Supported Waste Categories")
async def get_categories():
    """Return all supported waste categories and their metadata."""
    return {"success": True, "data": WASTE_CATEGORIES}


# ─── Model Management Endpoints ──────────────────────────────────────────────

@model_router.get("/info", summary="Active Model Information")
async def get_model_info():
    """Get details about the currently active AI model."""
    info = detection_engine.get_model_info()
    return {"success": True, "data": info}


@model_router.get("/versions", summary="All Model Versions")
async def get_model_versions():
    """List all model versions in the registry."""
    models = model_registry.get_all_models()
    return {"success": True, "data": {"models": models, "count": len(models)}}


@model_router.get("/deployments", summary="Deployment History")
async def get_deployment_history():
    """Get model deployment and rollback history."""
    deployments = model_registry.get_deployment_history()
    return {"success": True, "data": {"deployments": deployments, "count": len(deployments)}}


@model_router.post("/rollback", summary="Rollback to Previous Version")
async def rollback_model(req: RollbackRequest):
    """Rollback to a specific model version."""
    result = model_registry.rollback_model(req.version_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    return {"success": True, "message": result["message"], "data": result.get("deployment", {})}


@model_router.get("/training-history", summary="Training Epoch History")
async def get_training_history():
    """Get training loss, accuracy, and mAP history per epoch."""
    history = detection_engine.training_history
    return {"success": True, "data": {"epochs": history, "total_epochs": len(history)}}


@model_router.get("/confusion-matrix", summary="Confusion Matrix")
async def get_confusion_matrix():
    """Get the confusion matrix for the active model."""
    matrix = detection_engine.confusion_matrix
    labels = [c["label"] for c in WASTE_CATEGORIES.values()]
    return {"success": True, "data": {"matrix": matrix, "labels": labels}}


@model_router.get("/metrics", summary="Model Performance Metrics")
async def get_model_metrics():
    """Get accuracy, precision, recall, F1, mAP metrics."""
    metrics = detection_engine.metrics
    return {"success": True, "data": metrics}


# ─── Monitoring & AI Ops Endpoints ────────────────────────────────────────────

@monitoring_router.get("/system-health", summary="System Health Status")
async def get_system_health():
    """Get comprehensive system health including GPU, CPU, memory, and service status."""
    health = ai_monitor.get_system_health()
    return {"success": True, "data": health}


@monitoring_router.get("/inference-analytics", summary="Inference Analytics")
async def get_inference_analytics():
    """Get prediction throughput, confidence distribution, drift detection, and category analytics."""
    analytics = ai_monitor.get_inference_analytics()
    return {"success": True, "data": analytics}


@monitoring_router.get("/api-performance", summary="API Performance Metrics")
async def get_api_performance():
    """Get endpoint latency, throughput, and error rate metrics."""
    perf = ai_monitor.get_api_performance()
    return {"success": True, "data": perf}


@monitoring_router.get("/alerts", summary="System Alerts")
async def get_alerts():
    """Get AI system alerts and notifications."""
    alerts = ai_monitor.get_alerts()
    return {"success": True, "data": {"alerts": alerts, "count": len(alerts)}}


@monitoring_router.get("/dashboard-summary", summary="AI Ops Dashboard Summary")
async def get_ops_dashboard():
    """Aggregated summary for the AI Operations Dashboard frontend page."""
    health = ai_monitor.get_system_health()
    analytics = ai_monitor.get_inference_analytics()
    api_perf = ai_monitor.get_api_performance()
    alerts = ai_monitor.get_alerts()
    model_info = detection_engine.get_model_info()
    active_model = model_registry.get_active_model()
    training = detection_engine.training_history[-20:]
    confusion = detection_engine.confusion_matrix
    models = model_registry.get_all_models()
    deployments = model_registry.get_deployment_history()
    datasets = model_registry.get_datasets()

    return {
        "success": True,
        "data": {
            "system_health": health,
            "inference_analytics": analytics,
            "api_performance": api_perf,
            "alerts": alerts,
            "model_info": model_info,
            "active_model": {
                "name": active_model.model_name if active_model else "N/A",
                "version": active_model.version if active_model else "N/A",
                "accuracy": active_model.accuracy if active_model else 0,
                "mAP50": active_model.mAP50 if active_model else 0,
                "f1_score": active_model.f1_score if active_model else 0,
                "framework": active_model.framework if active_model else "N/A",
                "deployed_at": active_model.deployed_at if active_model else None,
            },
            "training_history": training,
            "confusion_matrix": {"matrix": confusion, "labels": [c["label"] for c in WASTE_CATEGORIES.values()]},
            "model_versions": models,
            "deployment_history": deployments,
            "datasets": datasets,
        },
    }


# ─── Dataset Endpoints ───────────────────────────────────────────────────────

@dataset_router.get("/", summary="List Dataset Versions")
async def get_datasets():
    datasets = model_registry.get_datasets()
    return {"success": True, "data": {"datasets": datasets, "count": len(datasets)}}


# ─── Health Endpoints ─────────────────────────────────────────────────────────

@health_router.get("/health", summary="Health Check")
async def health_check():
    return {
        "status": "UP",
        "service": settings.SERVICE_NAME,
        "version": settings.SERVICE_VERSION,
        "model_loaded": detection_engine.is_loaded,
        "timestamp": datetime.utcnow().isoformat(),
    }

@health_router.get("/ready", summary="Readiness Probe")
async def readiness_check():
    return "READY"
