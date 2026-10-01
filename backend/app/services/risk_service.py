from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.config import settings
from backend.app.models.orders import Order, OrderItem
from backend.app.models.catalogue import Product, RawMaterial, ProductMaterial
from backend.app.models.inventory import Inventory
from backend.app.models.suppliers import SupplierDelay
from backend.app.schemas.operations import OrderRiskItem


class RiskService:
    @staticmethod
    async def evaluate_order_risk(session: AsyncSession, order_identifier: str) -> Optional[OrderRiskItem]:
        ref_date = datetime.strptime(settings.DEMO_DATE, "%Y-%m-%d").replace(tzinfo=timezone.utc)

        # 1. Fetch order
        query = (
            select(Order)
            .options(selectinload(Order.customer), selectinload(Order.items).selectinload(OrderItem.product))
            .where((Order.order_number == order_identifier) | (Order.id == order_identifier))
        )
        res = await session.execute(query)
        order = res.scalar_one_or_none()
        if not order or not order.items:
            return None

        item = order.items[0]
        product = item.product
        days_until_deadline = (order.requested_delivery_date.replace(tzinfo=timezone.utc) - ref_date).days

        # Check finished goods inventory
        inv_res = await session.execute(select(Inventory).where(Inventory.product_id == product.id))
        fg_inv = inv_res.scalar_one_or_none()
        fg_available = fg_inv.available if fg_inv else 0.0

        risk_level = "LOW"
        reasons = []
        affected_material = None
        action = "Monitor standard order fulfillment"

        # Check for inventory shortage
        if fg_available < item.quantity:
            shortage_units = item.quantity - int(fg_available)
            reasons.append(f"Finished product inventory deficit ({shortage_units:,} units required from production)")

            # Check raw materials BOM
            bom_res = await session.execute(
                select(ProductMaterial, RawMaterial)
                .join(RawMaterial, ProductMaterial.material_id == RawMaterial.id)
                .where(ProductMaterial.product_id == product.id)
            )
            for pm, rm in bom_res.all():
                needed_mat = pm.quantity_required_per_unit * shortage_units
                m_inv_res = await session.execute(select(Inventory).where(Inventory.material_id == rm.id))
                m_inv = m_inv_res.scalar_one_or_none()
                m_avail = m_inv.available if m_inv else 0.0

                if m_avail < needed_mat:
                    affected_material = rm.material_code
                    reasons.append(f"Raw material shortage: {rm.material_code} ({rm.name}) has {m_avail:.1f} {rm.unit} available vs {needed_mat:.1f} required")
                    risk_level = "HIGH"
                    action = f"Initiate expedited procurement for {rm.material_code} and request planner review"

                # Check active supplier delays on this material
                delay_res = await session.execute(
                    select(SupplierDelay).where(
                        (SupplierDelay.material_id == rm.id) &
                        (SupplierDelay.status == "REPORTED")
                    )
                )
                active_delay = delay_res.scalar_one_or_none()
                if active_delay:
                    reasons.append(f"Active supplier delay on {rm.material_code}: delayed by {active_delay.delay_days} days ({active_delay.reason})")
                    risk_level = "CRITICAL" if days_until_deadline <= 15 else "HIGH"
                    action = f"Execute alternative supplier sourcing for {rm.material_code} and adjust production schedule"

        if days_until_deadline < 5 and risk_level != "LOW":
            risk_level = "CRITICAL"
            reasons.append(f"Immediate delivery risk: only {days_until_deadline} days remaining until deadline")

        primary_reason = "; ".join(reasons) if reasons else "Inventory sufficient for delivery"

        return OrderRiskItem(
            order_id=order.id,
            order_number=order.order_number,
            customer_name=order.customer.name,
            product_name=product.name,
            requested_quantity=item.quantity,
            requested_delivery_date=order.requested_delivery_date.strftime("%Y-%m-%d"),
            risk_level=risk_level,
            primary_risk_reason=primary_reason,
            affected_material=affected_material,
            recommended_action=action,
        )

    @staticmethod
    async def list_all_order_risks(session: AsyncSession) -> List[OrderRiskItem]:
        orders_res = await session.execute(select(Order.order_number).limit(50))
        order_numbers = orders_res.scalars().all()
        results: List[OrderRiskItem] = []
        for o_num in order_numbers:
            assessment = await RiskService.evaluate_order_risk(session, o_num)
            if assessment:
                results.append(assessment)
        results.sort(
            key=lambda x: (
                0 if x.risk_level == "CRITICAL" else (1 if x.risk_level == "HIGH" else (2 if x.risk_level == "MEDIUM" else 3))
            )
        )
        return results
