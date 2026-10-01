from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.services.inventory_service import InventoryService
from backend.app.schemas.operations import InventoryStatus

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("", response_model=List[InventoryStatus])
async def list_inventory(
    item_type: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
):
    return await InventoryService.list_all_inventory(session, item_type=item_type)


@router.get("/product/{sku}", response_model=InventoryStatus)
async def get_product_inventory(sku: str, session: AsyncSession = Depends(get_db)):
    inv = await InventoryService.get_product_inventory(session, sku)
    if not inv:
        raise HTTPException(status_code=404, detail=f"Product {sku} not found")
    return inv


@router.get("/material/{code}", response_model=InventoryStatus)
async def get_material_inventory(code: str, session: AsyncSession = Depends(get_db)):
    inv = await InventoryService.get_material_inventory(session, code)
    if not inv:
        raise HTTPException(status_code=404, detail=f"Material {code} not found")
    return inv
