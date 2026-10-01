from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.production import ProductionBatch, ProductionLine, ProductionSchedule
from backend.app.models.catalogue import Product
from backend.app.schemas.operations import ProductionCapacityCheck


class ProductionService:
    @staticmethod
    async def check_capacity(
        session: AsyncSession,
        product_sku: str,
        target_date_str: str,
    ) -> Optional[ProductionCapacityCheck]:
        target_date = datetime.strptime(target_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)

        # 1. Fetch product
        p_res = await session.execute(select(Product).where(Product.sku == product_sku))
        product = p_res.scalar_one_or_none()
        if not product:
            return None

        # Determine line category
        line_cat = product.category
        l_res = await session.execute(
            select(ProductionLine).where(ProductionLine.category == line_cat)
        )
        line = l_res.scalar_one_or_none()
        if not line:
            # fallback line
            l_res = await session.execute(select(ProductionLine).limit(1))
            line = l_res.scalar_one()

        # Check existing scheduled hours on that day
        start_day = target_date.replace(hour=0, minute=0, second=0)
        end_day = target_date.replace(hour=23, minute=59, second=59)

        s_res = await session.execute(
            select(ProductionSchedule).where(
                (ProductionSchedule.line_code == line.line_code) &
                (ProductionSchedule.scheduled_date >= start_day) &
                (ProductionSchedule.scheduled_date <= end_day)
            )
        )
        slots = s_res.scalars().all()
        hours_allocated = sum(s.hours_allocated for s in slots)
        available_hours = max(0.0, line.daily_capacity_hours - hours_allocated)

        hours_required = product.production_time_hours
        has_capacity = available_hours >= hours_required

        # Fetch scheduled batches on that line
        b_res = await session.execute(
            select(ProductionBatch).where(
                (ProductionBatch.line_id == line.line_code) &
                (ProductionBatch.scheduled_start_date >= start_day) &
                (ProductionBatch.scheduled_start_date <= end_day)
            )
        )
        batches = b_res.scalars().all()

        return ProductionCapacityCheck(
            product_sku=product.sku,
            line_code=line.line_code,
            line_name=line.name,
            target_date=target_date_str,
            hours_required=hours_required,
            hours_available=available_hours,
            has_capacity=has_capacity,
            scheduled_batches=[
                {
                    "batch_number": b.batch_number,
                    "target_quantity": b.target_quantity,
                    "status": b.status,
                }
                for b in batches
            ],
        )

    @staticmethod
    async def list_batches(session: AsyncSession, status: Optional[str] = None) -> List[Dict[str, Any]]:
        query = select(ProductionBatch).options(selectinload(ProductionBatch.product))
        if status:
            query = query.where(ProductionBatch.status == status)
        res = await session.execute(query)
        batches = res.scalars().all()
        return [
            {
                "id": b.id,
                "batch_number": b.batch_number,
                "product_sku": b.product.sku,
                "product_name": b.product.name,
                "target_quantity": b.target_quantity,
                "status": b.status,
                "scheduled_start_date": b.scheduled_start_date.strftime("%Y-%m-%d"),
                "scheduled_end_date": b.scheduled_end_date.strftime("%Y-%m-%d"),
                "line_id": b.line_id,
                "block_reason": b.block_reason,
            }
            for b in batches
        ]
