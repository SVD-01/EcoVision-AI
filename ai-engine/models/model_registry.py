"""
EcoVision AI Model Registry
Manages model versions, deployment history, rollback, A/B testing, and lifecycle.
"""
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field, asdict
import random


@dataclass
class ModelVersion:
    version_id: str
    model_name: str
    version: str
    framework: str
    accuracy: float
    mAP50: float
    f1_score: float
    parameters_count: int
    weights_size_mb: float
    status: str  # 'active' | 'staging' | 'archived' | 'training'
    deployed_at: Optional[str] = None
    training_completed_at: Optional[str] = None
    dataset_version: str = "v3.2.0"
    notes: str = ""


@dataclass
class DeploymentRecord:
    deployment_id: str
    model_version_id: str
    model_name: str
    version: str
    action: str  # 'deploy' | 'rollback' | 'scale' | 'retire'
    status: str  # 'success' | 'failed' | 'pending'
    timestamp: str
    deployed_by: str = "system"
    notes: str = ""


class ModelRegistry:
    """Centralized model version control, deployment tracking, and rollback management."""

    def __init__(self):
        self.models: List[ModelVersion] = self._seed_models()
        self.deployments: List[DeploymentRecord] = self._seed_deployments()
        self.datasets: List[Dict[str, Any]] = self._seed_datasets()

    def get_active_model(self) -> Optional[ModelVersion]:
        for model in self.models:
            if model.status == "active":
                return model
        return self.models[0] if self.models else None

    def get_all_models(self) -> List[Dict[str, Any]]:
        return [asdict(m) for m in self.models]

    def get_deployment_history(self) -> List[Dict[str, Any]]:
        return [asdict(d) for d in self.deployments]

    def get_datasets(self) -> List[Dict[str, Any]]:
        return self.datasets

    def rollback_model(self, target_version_id: str) -> Dict[str, Any]:
        target = None
        for model in self.models:
            if model.version_id == target_version_id:
                target = model
                break
        
        if not target:
            return {"success": False, "message": "Model version not found"}

        # Deactivate current active model
        for model in self.models:
            if model.status == "active":
                model.status = "archived"

        target.status = "active"
        target.deployed_at = datetime.utcnow().isoformat()

        record = DeploymentRecord(
            deployment_id=f"dep-{uuid.uuid4().hex[:8]}",
            model_version_id=target.version_id,
            model_name=target.model_name,
            version=target.version,
            action="rollback",
            status="success",
            timestamp=datetime.utcnow().isoformat(),
            notes=f"Rollback to {target.version}",
        )
        self.deployments.insert(0, record)

        return {"success": True, "message": f"Rolled back to {target.version}", "deployment": asdict(record)}

    def _seed_models(self) -> List[ModelVersion]:
        now = datetime.utcnow()
        return [
            ModelVersion(
                version_id="mv-001", model_name="ecovision-yolov8-waste-v2", version="2.4.0",
                framework="YOLOv8+PyTorch", accuracy=0.942, mAP50=0.951, f1_score=0.936,
                parameters_count=85_400_000, weights_size_mb=163.2, status="active",
                deployed_at=(now - timedelta(days=3)).isoformat(),
                training_completed_at=(now - timedelta(days=5)).isoformat(),
                dataset_version="v3.2.0", notes="Production model with CSPDarknet53 backbone",
            ),
            ModelVersion(
                version_id="mv-002", model_name="ecovision-yolov8-waste-v2", version="2.3.1",
                framework="YOLOv8+PyTorch", accuracy=0.928, mAP50=0.939, f1_score=0.924,
                parameters_count=85_400_000, weights_size_mb=163.0, status="archived",
                deployed_at=(now - timedelta(days=18)).isoformat(),
                training_completed_at=(now - timedelta(days=20)).isoformat(),
                dataset_version="v3.1.0", notes="Previous production model",
            ),
            ModelVersion(
                version_id="mv-003", model_name="ecovision-efficientdet-lite", version="1.2.0",
                framework="TensorFlow/TFLite", accuracy=0.891, mAP50=0.904, f1_score=0.888,
                parameters_count=12_800_000, weights_size_mb=48.5, status="staging",
                training_completed_at=(now - timedelta(days=8)).isoformat(),
                dataset_version="v3.2.0", notes="Lightweight model for edge/IoT deployment",
            ),
            ModelVersion(
                version_id="mv-004", model_name="ecovision-resnet50-classifier", version="3.0.0",
                framework="PyTorch/ONNX", accuracy=0.918, mAP50=0.0, f1_score=0.912,
                parameters_count=25_600_000, weights_size_mb=97.8, status="archived",
                training_completed_at=(now - timedelta(days=42)).isoformat(),
                dataset_version="v2.8.0", notes="Classification-only model (no detection)",
            ),
        ]

    def _seed_deployments(self) -> List[DeploymentRecord]:
        now = datetime.utcnow()
        return [
            DeploymentRecord("dep-a1", "mv-001", "ecovision-yolov8-waste-v2", "2.4.0", "deploy", "success",
                           (now - timedelta(days=3)).isoformat(), "CI/CD Pipeline", "Automated deployment after validation"),
            DeploymentRecord("dep-a2", "mv-002", "ecovision-yolov8-waste-v2", "2.3.1", "retire", "success",
                           (now - timedelta(days=3)).isoformat(), "CI/CD Pipeline", "Superseded by v2.4.0"),
            DeploymentRecord("dep-a3", "mv-002", "ecovision-yolov8-waste-v2", "2.3.1", "deploy", "success",
                           (now - timedelta(days=18)).isoformat(), "Admin: Maya Chen"),
            DeploymentRecord("dep-a4", "mv-004", "ecovision-resnet50-classifier", "3.0.0", "deploy", "success",
                           (now - timedelta(days=42)).isoformat(), "Admin: Ravi Kumar", "Initial production classifier"),
        ]

    def _seed_datasets(self) -> List[Dict[str, Any]]:
        return [
            {
                "version": "v3.2.0", "description": "Full 6-class waste detection dataset with augmentations",
                "samples": 48500, "categories": {"plastic": 9200, "paper": 8100, "organic": 7800, "metal": 8400, "glass": 7500, "e-waste": 7500},
                "verified": True, "created_at": "2026-06-15T10:00:00Z",
            },
            {
                "version": "v3.1.0", "description": "Expanded dataset with edge-case annotations",
                "samples": 42000, "categories": {"plastic": 8000, "paper": 7200, "organic": 6800, "metal": 7000, "glass": 6500, "e-waste": 6500},
                "verified": True, "created_at": "2026-04-20T10:00:00Z",
            },
            {
                "version": "v2.8.0", "description": "Original multi-source collection",
                "samples": 35000, "categories": {"plastic": 6800, "paper": 6200, "organic": 5500, "metal": 5800, "glass": 5200, "e-waste": 5500},
                "verified": True, "created_at": "2026-01-10T10:00:00Z",
            },
        ]


model_registry = ModelRegistry()
