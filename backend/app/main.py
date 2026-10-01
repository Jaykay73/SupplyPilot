from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.db.session import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting SupplyPilot Backend [{settings.APP_ENV}] on port {settings.API_PORT}")
    # Create tables automatically for local/test runs
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    logger.info("Shutting down SupplyPilot Backend")


app = FastAPI(
    title="SupplyPilot API",
    description="AI Operations Platform for Pharmaceutical Supply Chains",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "SupplyPilot Operations API",
        "environment": settings.APP_ENV,
        "demo_date": settings.DEMO_DATE,
        "currency": settings.CURRENCY,
        "llm_provider": settings.LLM_PROVIDER,
        "jev_enabled": settings.JEV_ENABLED,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=settings.API_PORT, reload=True)
