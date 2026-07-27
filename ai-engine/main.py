"""
EcoVision AI Engine - FastAPI Application Entry Point
Production-ready AI microservice for waste classification, detection, and ML operations.
"""
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from api.routes import predict_router, model_router, monitoring_router, dataset_router, health_router
from models.inference_engine import detection_engine


def create_app() -> FastAPI:
    app = FastAPI(
        title="EcoVision AI Engine",
        description="Enterprise AI microservice for waste classification, multi-class detection, "
                    "instance segmentation, explainable AI, model lifecycle management, "
                    "and real-time AI operations monitoring.",
        version=settings.SERVICE_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount routers
    api_prefix = "/api/v1"
    app.include_router(health_router, prefix=api_prefix)
    app.include_router(predict_router, prefix=api_prefix)
    app.include_router(model_router, prefix=api_prefix)
    app.include_router(monitoring_router, prefix=api_prefix)
    app.include_router(dataset_router, prefix=api_prefix)

    @app.on_event("startup")
    async def startup():
        detection_engine.load_model()
        print(f"EcoVision AI Engine v{settings.SERVICE_VERSION} started on port {settings.PORT}")
        print(f"Model: {settings.ACTIVE_MODEL_NAME} v{settings.ACTIVE_MODEL_VERSION}")
        print(f"Docs: http://localhost:{settings.PORT}/docs")

    @app.get("/", tags=["Root"])
    async def root():
        return {
            "service": settings.SERVICE_NAME,
            "version": settings.SERVICE_VERSION,
            "status": "operational",
            "docs": f"http://localhost:{settings.PORT}/docs",
        }

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG, workers=1)
