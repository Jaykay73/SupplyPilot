from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.models.production import ProductionLine
from backend.app.services.production_service import ProductionService

router = APIRouter(prefix="/production", tags=["Production"])


@router.get("/batches")
async def list_batches(status: Optional[str] = None, session: AsyncSession = Depends(get_db)):
    return await ProductionService.list_batches(session, status=status)


@router.get("/capacity")
async def check_capacity(
    product_sku: str,
    target_date: str,
    session: AsyncSession = Depends(get_db),
):
    return await ProductionService.check_capacity(session, product_sku, target_date)


@router.get("/lines")
async def list_lines(session: AsyncSession = Depends(get_db)):
    res = await session.execute(select(ProductionLine))
    lines = res.scalars().all()
    return [
        {
            "id": l.id,
            "line_code": l.line_code,
            "name": l.name,
            "category": l.category,
            "daily_capacity_hours": l.daily_capacity_hours,
            "efficiency_factor": l.efficiency_factor,
        }
        for l in lines
    ]
