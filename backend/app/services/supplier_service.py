from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.config import settings
from backend.app.models.catalogue import RawMaterial
from backend.app.models.suppliers import Supplier, SupplierMaterial
from backend.app.schemas.operations import SupplierRecommendationReport, SupplierCandidate


class SupplierService:
    @staticmethod
    async def recommend_supplier(
        session: AsyncSession,
        material_code: str,
        required_quantity: float,
        deadline_str: str,
    ) -> SupplierRecommendationReport:
        ref_date = datetime.strptime(settings.DEMO_DATE, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        try:
            deadline = datetime.strptime(deadline_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except Exception:
            deadline = ref_date + timedelta(days=7)

        available_days = max(1, (deadline - ref_date).days)

        # 1. Fetch material
        mat_res = await session.execute(
            select(RawMaterial).where(RawMaterial.material_code == material_code)
        )
        material = mat_res.scalar_one_or_none()
        if not material:
            return SupplierRecommendationReport(
                material_code=material_code,
                material_name="Unknown",
                required_quantity=required_quantity,
                unit="kg",
                deadline=deadline_str,
                policy_notes=[f"Material {material_code} not found in catalogue."],
            )

        # 2. Fetch all suppliers providing this material
        links_res = await session.execute(
            select(SupplierMaterial, Supplier)
            .join(Supplier, SupplierMaterial.supplier_id == Supplier.id)
            .where(SupplierMaterial.material_id == material.id)
        )
        links = links_res.all()

        eligible_candidates: List[SupplierCandidate] = []
        unapproved_candidates: List[Dict[str, Any]] = []
        policy_notes: List[str] = []

        # Find min/max for normalization
        valid_prices = [sm.unit_price for sm, sup in links if sm.is_approved]
        min_price = min(valid_prices) if valid_prices else 1.0
        max_price = max(valid_prices) if valid_prices else 1.0

        for sm, sup in links:
            if not sm.is_approved or sm.qualification_status == "RESTRICTED":
                unapproved_candidates.append({
                    "supplier_code": sup.supplier_code,
                    "supplier_name": sup.name,
                    "unit_price": sm.unit_price,
                    "reason": f"Disqualified by policy: qualification status is {sm.qualification_status} and approved flag is False.",
                })
                continue

            can_meet = sm.lead_time_days <= available_days
            eta = ref_date + timedelta(days=sm.lead_time_days)
            total_cost = round(sm.unit_price * required_quantity, 2)

            # Deterministic scoring:
            # 1. Lead time score: 1.0 if can meet, discounted if over
            lead_score = 1.0 if can_meet else max(0.1, available_days / sm.lead_time_days)
            # 2. Reliability score: 0.0 - 1.0
            rel_score = sup.overall_reliability_score
            # 3. Price score: lower is better
            price_score = 1.0 - ((sm.unit_price - min_price) / (max_price - min_price + 1e-6))

            # Composite weighted formula
            composite = round(0.40 * lead_score + 0.35 * rel_score + 0.25 * price_score, 4)

            reason_parts = [
                f"Lead time {sm.lead_time_days} days (ETA {eta.strftime('%Y-%m-%d')})",
                f"Reliability {int(sup.overall_reliability_score * 100)}%",
                f"Unit price EUR {sm.unit_price:.2f}/kg (Total EUR {total_cost:,.2f})",
            ]
            if not can_meet:
                reason_parts.append("WARNING: Lead time exceeds requested delivery date")

            eligible_candidates.append(SupplierCandidate(
                supplier_id=sup.id,
                supplier_code=sup.supplier_code,
                supplier_name=sup.name,
                unit_price=sm.unit_price,
                lead_time_days=sm.lead_time_days,
                can_meet_deadline=can_meet,
                estimated_arrival_date=eta.strftime("%Y-%m-%d"),
                reliability_score=sup.overall_reliability_score,
                weekly_capacity=sm.weekly_capacity,
                is_approved=sm.is_approved,
                composite_score=composite,
                total_cost=total_cost,
                recommendation_reason="; ".join(reason_parts),
            ))

        # Sort eligible candidates by composite score descending
        # Favoring candidates that can meet the deadline first
        eligible_candidates.sort(
            key=lambda c: (1 if c.can_meet_deadline else 0, c.composite_score),
            reverse=True,
        )

        recommended = eligible_candidates[0] if eligible_candidates else None
        if unapproved_candidates:
            policy_notes.append(
                f"{len(unapproved_candidates)} supplier(s) excluded due to policy non-compliance."
            )

        return SupplierRecommendationReport(
            material_code=material.material_code,
            material_name=material.name,
            required_quantity=required_quantity,
            unit=material.unit,
            deadline=deadline_str,
            recommended_supplier=recommended,
            eligible_candidates=eligible_candidates,
            unapproved_candidates=unapproved_candidates,
            policy_notes=policy_notes,
        )
