from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.services.cascade_service import CascadeService
from backend.app.schemas.operations import FlagshipCascadeReport

router = APIRouter(prefix="/events", tags=["Domain Events"])


@router.post("/flagship-scenario", response_model=FlagshipCascadeReport)
@router.post("/simulate-delay", response_model=FlagshipCascadeReport)
async def trigger_flagship_scenario(session: AsyncSession = Depends(get_db)):
    """Triggers and executes the flagship supplier delay cascade analysis."""
    report = await CascadeService.run_flagship_cascade(session, "DELAY-2026-001")
    if not report:
        raise HTTPException(status_code=404, detail="Flagship scenario delay record not found. Please run seed script.")
    return report


@router.get("", response_model=List[Dict[str, Any]])
@router.get("/", response_model=List[Dict[str, Any]])
async def list_events(session: AsyncSession = Depends(get_db)):
    """Returns recent supply chain disruption events."""
    return [
        {
            "event_id": "EVT-2026-001",
            "event_type": "SUPPLIER_SHIPMENT_DELAY",
            "delay_code": "DELAY-2026-001",
            "severity": "HIGH",
            "description": "BioSynth Corp reported a 5-day delivery delay on API-004 (Doxorubicin HCl).",
            "status": "ACTIVE_INVESTIGATION",
        }
    ]
