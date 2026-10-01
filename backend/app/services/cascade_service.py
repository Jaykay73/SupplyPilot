from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.config import settings
from backend.app.models.suppliers import Supplier, SupplierDelay, SupplierMaterial
from backend.app.models.catalogue import RawMaterial, Product
from backend.app.models.production import ProductionBatch
from backend.app.models.orders import Order, OrderItem, Customer
from backend.app.services.supplier_service import SupplierService
from backend.app.schemas.operations import FlagshipCascadeReport, SupplierCandidate


class CascadeService:
    @staticmethod
    async def run_flagship_cascade(
        session: AsyncSession,
        delay_code: str = "DELAY-2026-001"
    ) -> Optional[FlagshipCascadeReport]:
        ref_date = datetime.strptime(settings.DEMO_DATE, "%Y-%m-%d").replace(tzinfo=timezone.utc)

        # 1. Retrieve the delay event
        delay_res = await session.execute(
            select(SupplierDelay)
            .options(selectinload(SupplierDelay.supplier), selectinload(SupplierDelay.material))
            .where(SupplierDelay.delay_code == delay_code)
        )
        delay = delay_res.scalar_one_or_none()
        if not delay:
            return None

        supplier = delay.supplier
        material = delay.material

        # 2. Identify affected production batches
        # Find batches using product that requires this material
        batches_res = await session.execute(
            select(ProductionBatch)
            .options(selectinload(ProductionBatch.product))
            .where(ProductionBatch.status == "SCHEDULED")
        )
        all_batches = batches_res.scalars().all()
        affected_batches: List[Dict[str, Any]] = []
        for b in all_batches:
            if b.product.sku == "PRD-001":  # Paracetamol IV Solution depends on API-004
                affected_batches.append({
                    "batch_id": b.id,
                    "batch_number": b.batch_number,
                    "product_sku": b.product.sku,
                    "product_name": b.product.name,
                    "target_quantity": b.target_quantity,
                    "current_start_date": b.scheduled_start_date.strftime("%Y-%m-%d"),
                    "impact": f"Blocked by {delay.delay_days}-day delay in raw material {material.material_code}",
                })

        # 3. Identify affected customer orders
        orders_res = await session.execute(
            select(Order)
            .options(selectinload(Order.customer), selectinload(Order.items).selectinload(OrderItem.product))
            .where(Order.order_number.in_(["ORD-1847", "ORD-1842"]))
        )
        affected_orders_raw = orders_res.scalars().all()
        affected_orders: List[Dict[str, Any]] = []
        for o in affected_orders_raw:
            affected_orders.append({
                "order_id": o.id,
                "order_number": o.order_number,
                "customer_name": o.customer.name,
                "customer_email": o.customer.contact_email,
                "requested_date": o.requested_delivery_date.strftime("%Y-%m-%d"),
                "total_amount": o.total_amount,
                "impact": "Delivery deadline at risk without expedited alternative sourcing",
            })

        # 4. Evaluate alternative suppliers for API-004
        deadline_str = (ref_date + timedelta(days=15)).strftime("%Y-%m-%d")
        rec_report = await SupplierService.recommend_supplier(
            session=session,
            material_code=material.material_code,
            required_quantity=1500.0,
            deadline_str=deadline_str,
        )

        # 5. Production Rescheduling Plan
        reschedule_plan = {
            "batch_number": "BATCH-2026-104",
            "current_start_date": "2026-10-12",
            "proposed_start_date": "2026-10-14",
            "status": "PROPOSED",
            "rationale": "Shift 48 hours to align with alternative expedited delivery arrival",
        }

        # 6. Customer Communication Draft (Simulated)
        comm_draft = {
            "recipient": "procurement@medix-logistics.de",
            "subject": "PharmaPulse Operations Update: Order #ORD-1847 Fulfillment Status",
            "body": (
                "Dear Medix Procurement Team,\n\n"
                "We are proactively writing to advise that a planned upstream supply chain adjustment "
                "for API-004 has been mitigated via our secondary qualified supplier network. "
                "Production for your order #ORD-1847 (5,000 vials of Paracetamol IV 10mg/ml) "
                "has been re-sequenced to ensure target delivery by October 20, 2026 remains on schedule.\n\n"
                "Kind regards,\n"
                "PharmaPulse Operations & Supply Assurance"
            ),
            "is_simulated": True,
        }

        # Value: 1,500 kg * €5.60 or €5.95 = €8,400 -> Requires Procurement Officer approval (5k-25k)
        est_cost = rec_report.recommended_supplier.total_cost if rec_report.recommended_supplier else 8400.0

        return FlagshipCascadeReport(
            delay_code=delay.delay_code,
            supplier_name=supplier.name,
            material_code=material.material_code,
            delay_days=delay.delay_days,
            affected_batches=affected_batches,
            affected_orders=affected_orders,
            alternative_suppliers=rec_report.eligible_candidates,
            recommended_supplier=rec_report.recommended_supplier,
            reschedule_plan=reschedule_plan,
            customer_communication_draft=comm_draft,
            approval_required=True,
            approval_role="procurement_officer",
            estimated_cost=est_cost,
        )
