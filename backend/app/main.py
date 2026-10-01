from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.logging import logger
import backend.app.db.base  # Register all models on Base.metadata
from backend.app.db.session import engine, Base

# Import Routers
from backend.app.api.auth import router as auth_router
from backend.app.api.chat import router as chat_router
from backend.app.api.orders import router as orders_router
from backend.app.api.inventory import router as inventory_router
from backend.app.api.suppliers import router as suppliers_router
from backend.app.api.production import router as production_router
from backend.app.api.approvals import router as approvals_router
from backend.app.api.runs import router as runs_router
from backend.app.api.events import router as events_router
from backend.app.api.audit import router as audit_router
from backend.app.api.dashboard import router as dashboard_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting SupplyPilot Backend [{settings.APP_ENV}] on port {settings.API_PORT}")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    logger.info("Shutting down SupplyPilot Backend")


app = FastAPI(
    title="SupplyPilot Operations API",
    description="Autonomous AI operations platform connecting inventory, suppliers, production, and policy governance.",
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

# Mount Routers
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(orders_router)
app.include_router(inventory_router)
app.include_router(suppliers_router)
app.include_router(production_router)
app.include_router(approvals_router)
app.include_router(runs_router)
app.include_router(events_router)
app.include_router(audit_router)
app.include_router(dashboard_router)


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
