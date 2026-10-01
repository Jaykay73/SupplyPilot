from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.services.cascade_service import CascadeService
from backend.app.schemas.operations import FlagshipCascadeReport

router = APIRouter(prefix="/events", tags=["Domain Events"])


@router.post("/flagship-scenario", response_model=FlagshipCascadeReport)
async def trigger_flagship_scenario(session: AsyncSession = Depends(get_db)):
    """Triggers and executes the flagship supplier delay cascade analysis."""
    report = await CascadeService.run_flagship_cascade(session, "DELAY-2026-001")
    if not report:
        raise HTTPException(status_code=404, detail="Flagship scenario delay record not found. Please run seed script.")
    return report
