from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.services.order_service import OrderService
from backend.app.schemas.operations import OrderSummary

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=List[OrderSummary])
async def list_orders(
    status: Optional[str] = None,
    limit: int = 50,
    session: AsyncSession = Depends(get_db),
):
    return await OrderService.list_orders(session, status=status, limit=limit)


@router.get("/at-risk", response_model=List[OrderSummary])
async def get_at_risk_orders(session: AsyncSession = Depends(get_db)):
    return await OrderService.get_at_risk_orders(session)


@router.get("/{order_id}", response_model=OrderSummary)
async def get_order(order_id: str, session: AsyncSession = Depends(get_db)):
    order = await OrderService.get_order(session, order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    return order
