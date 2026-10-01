from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
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
    description="""
### SupplyPilot — Connected Operational Intelligence & Workflow Automation

**PharmaPulse Synthetics Operations Platform** connecting inventory, orders, suppliers, production schedules, and corporate procurement policies with deterministic rule enforcement and human-in-the-loop approvals.

#### Demo Personas (Password: `demo123`):
* **Procurement Officer:** `procurement@demo.local` (Autonomous <= €5,000; Approvals up to €25,000)
* **Operations Manager:** `manager@demo.local` (Unrestricted financial approval > €25,000)
* **Production Planner:** `planner@demo.local` (Master production schedule and line capacity)
* **Administrator:** `admin@demo.local` (Full system governance and audit logs)

*Note: In demo mode, endpoints default to the Procurement Officer persona if no Bearer token is passed, or you can click the green **Authorize** button above to authenticate as any persona.*
""",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    swagger_ui_parameters={"persistAuthorization": True},
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

# Mount Routers under both /api/v1 (for frontend client) and root (for backward compatibility)
api_v1_router = APIRouter(prefix="/api/v1")

for r in [
    auth_router,
    chat_router,
    orders_router,
    inventory_router,
    suppliers_router,
    production_router,
    approvals_router,
    runs_router,
    events_router,
    audit_router,
    dashboard_router,
]:
    api_v1_router.include_router(r)
    app.include_router(r)

app.include_router(api_v1_router)


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
