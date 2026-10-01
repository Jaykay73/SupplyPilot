from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.models.suppliers import Supplier, SupplierMaterial
from backend.app.services.supplier_service import SupplierService
from backend.app.schemas.operations import SupplierRecommendationReport

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.get("")
async def list_suppliers(session: AsyncSession = Depends(get_db)):
    res = await session.execute(
        select(Supplier).options(selectinload(Supplier.materials).selectinload(SupplierMaterial.material))
    )
    suppliers = res.scalars().all()
    return [
        {
            "id": s.id,
            "supplier_code": s.supplier_code,
            "name": s.name,
            "country": s.country,
            "reliability_score": s.overall_reliability_score,
            "status": s.status,
            "contact_email": s.contact_email,
            "qualified_materials": [
                {
                    "material_code": sm.material.material_code,
                    "material_name": sm.material.name,
                    "unit_price": sm.unit_price,
                    "lead_time_days": sm.lead_time_days,
                    "qualification_status": sm.qualification_status,
                    "is_approved": sm.is_approved,
                }
                for sm in s.materials
            ],
        }
        for s in suppliers
    ]


@router.get("/recommend", response_model=SupplierRecommendationReport)
async def recommend_supplier(
    material_code: str,
    quantity: float,
    deadline: str,
    session: AsyncSession = Depends(get_db),
):
    return await SupplierService.recommend_supplier(session, material_code, quantity, deadline)


@router.get("/{supplier_id}")
async def get_supplier(supplier_id: str, session: AsyncSession = Depends(get_db)):
    res = await session.execute(
        select(Supplier)
        .options(selectinload(Supplier.materials).selectinload(SupplierMaterial.material))
        .where((Supplier.supplier_code == supplier_id) | (Supplier.id == supplier_id))
    )
    sup = res.scalar_one_or_none()
    if not sup:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return sup
