"""
EcoVision AI Engine - Centralized Configuration
Manages all environment variables, model paths, and service parameters.
"""
import os
from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import Field


class AIEngineSettings(BaseSettings):
    """Enterprise AI Engine configuration with environment variable support."""
    
    # Service Configuration
    SERVICE_NAME: str = "ecovision-ai-engine"
    SERVICE_VERSION: str = "2.4.0"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # Security
    API_KEY: str = "ecovision-ai-engine-key-2026"
    JWT_SECRET: str = "ecovision_super_secret_jwt_key_2026_enterprise"
    ALLOWED_ORIGINS: str = "*"
    
    # Backend Communication
    BACKEND_URL: str = "http://localhost:5000"
    BACKEND_API_PREFIX: str = "/api/v1"
    BACKEND_API_KEY: str = "ecovision-backend-service-key"
    
    # MongoDB for AI Data
    MONGO_URI: str = "mongodb://localhost:27017/ecovision_ai_engine"
    
    # Redis for Caching & Task Queue
    REDIS_URL: str = "redis://localhost:6379/1"
    
    # Model Registry
    MODEL_REGISTRY_PATH: str = "./ai-engine/models/registry"
    ACTIVE_MODEL_NAME: str = "ecovision-yolov8-waste-v2"
    ACTIVE_MODEL_VERSION: str = "2.4.0"
    ACTIVE_MODEL_FRAMEWORK: str = "YOLOv8+PyTorch"
    MODEL_CONFIDENCE_THRESHOLD: float = 0.45
    MODEL_IOU_THRESHOLD: float = 0.50
    MAX_DETECTIONS: int = 50
    
    # Dataset Management
    DATASET_PATH: str = "./ai-engine/datasets"
    DATASET_VERSION: str = "v3.2.0"
    DATASET_SAMPLES_COUNT: int = 48500
    
    # GPU / Hardware
    USE_GPU: bool = True
    GPU_DEVICE: str = "cuda:0"
    BATCH_SIZE: int = 16
    NUM_WORKERS: int = 4
    
    # Image Processing
    INPUT_IMAGE_SIZE: int = 640
    MAX_IMAGE_SIZE_MB: int = 15
    SUPPORTED_FORMATS: str = "jpg,jpeg,png,webp,heic,bmp,tiff"
    
    # Storage
    STORAGE_PROVIDER: str = "local"
    LOCAL_UPLOAD_PATH: str = "./ai-engine/uploads"
    S3_BUCKET: str = "ecovision-ai-predictions"
    CLOUDINARY_CLOUD_NAME: str = ""
    
    # Inference Performance
    MAX_INFERENCE_TIME_MS: int = 5000
    PREDICTION_CACHE_TTL: int = 300
    BATCH_PREDICTION_MAX: int = 32
    
    # Training Configuration
    TRAINING_EPOCHS: int = 100
    LEARNING_RATE: float = 0.001
    WEIGHT_DECAY: float = 0.0005
    EARLY_STOPPING_PATIENCE: int = 15
    
    # Monitoring
    ENABLE_PROMETHEUS: bool = True
    METRICS_PORT: int = 9090
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_prefix = "AI_"


settings = AIEngineSettings()

# Waste category definitions used across the AI engine
WASTE_CATEGORIES = {
    0: {"id": "plastic", "label": "Plastic (PET/HDPE)", "color": "#22d3ee", "recyclable": True, "hazardous": False},
    1: {"id": "paper", "label": "Paper & Cardboard", "color": "#fde68a", "recyclable": True, "hazardous": False},
    2: {"id": "organic", "label": "Organic Compost", "color": "#34d399", "recyclable": False, "hazardous": False},
    3: {"id": "metal", "label": "Aluminum & Metal", "color": "#a5b4fc", "recyclable": True, "hazardous": False},
    4: {"id": "glass", "label": "Glass Container", "color": "#67e8f9", "recyclable": True, "hazardous": False},
    5: {"id": "e-waste", "label": "Electronic Waste", "color": "#c084fc", "recyclable": False, "hazardous": True},
}

IMPACT_FACTORS = {
    "plastic":  {"carbon_kg": 0.42, "water_liters": 18, "trees": 0.02, "points": 25},
    "paper":    {"carbon_kg": 0.65, "water_liters": 24, "trees": 0.05, "points": 20},
    "organic":  {"carbon_kg": 0.38, "water_liters": 12, "trees": 0.01, "points": 30},
    "metal":    {"carbon_kg": 1.45, "water_liters": 35, "trees": 0.08, "points": 40},
    "glass":    {"carbon_kg": 0.31, "water_liters": 15, "trees": 0.02, "points": 25},
    "e-waste":  {"carbon_kg": 2.80, "water_liters": 65, "trees": 0.15, "points": 80},
}

DISPOSAL_RECOMMENDATIONS = {
    "plastic": [
        "Rinse, dry, flatten, and place in the blue recycling stream.",
        "Remove caps and labels if your local facility requires it.",
        "Avoid placing flexible film in rigid recycling bins.",
    ],
    "paper": [
        "Keep dry, remove food residue, and bundle cardboard separately.",
        "Shred sensitive documents before recycling.",
        "Paper can be recycled up to 7 times before fibers degrade.",
    ],
    "organic": [
        "Send to compost or smart bin organics stream within 24 hours.",
        "Remove produce stickers and non-compostable wrappers.",
        "Coffee grounds and eggshells are excellent compost additives.",
    ],
    "metal": [
        "Empty contents, compress where possible, and keep sharp lids covered.",
        "Aluminum can be recycled infinitely without quality loss.",
        "Rinse aerosol cans but do not puncture them.",
    ],
    "glass": [
        "Rinse and separate by color when your municipality requires it.",
        "Do not mix with ceramics, mirrors, or window glass.",
        "Glass recycling reduces furnace energy by 30%.",
    ],
    "e-waste": [
        "Do not place in curbside bins. Use certified electronics drop-off.",
        "Tape exposed battery terminals before disposal.",
        "Remove personal data from devices before recycling.",
    ],
}
