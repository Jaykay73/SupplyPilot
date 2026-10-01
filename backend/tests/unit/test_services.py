import pytest
from backend.app.db.session import AsyncSessionLocal
import backend.app.db.base  # ensure all models registered
from backend.app.services.inventory_service import InventoryService
from backend.app.services.order_service import OrderService
from backend.app.services.bom_service import BOMService
from backend.app.services.supplier_service import SupplierService
from backend.app.services.production_service import ProductionService
from backend.app.services.risk_service import RiskService
from backend.app.services.cascade_service import CascadeService


@pytest.mark.asyncio
async def test_inventory_service_availability():
    async with AsyncSessionLocal() as session:
        inv = await InventoryService.get_product_inventory(session, "PRD-001")
        assert inv is not None
        assert inv.on_hand == 3100.0
        assert inv.available == 3100.0

        mat_inv = await InventoryService.get_material_inventory(session, "API-004")
        assert mat_inv is not None
        assert mat_inv.available == 800.0


@pytest.mark.asyncio
async def test_bom_shortage_calculation_medix():
    async with AsyncSessionLocal() as session:
        # Medix Order ORD-1847 requires 5000 vials of PRD-001
        # Available finished goods: 3100 -> Production required: 1900 vials
        # BOM for PRD-001 has 0.30 kg API-004 per unit -> 1900 * 0.30 = 570 kg
        # But available API-004 in stock is 800 kg.
        # Wait, if order requested 5,000 vials and finished is 3,100 -> deficit is 1,900 vials.
        # 1,900 * 0.30 = 570 kg needed.
        # If production scheduled standard batch is 5,000 vials -> 5,000 * 0.30 = 1,500 kg needed (shortage: 1,500 - 800 = 700 kg).
        report = await BOMService.calculate_material_shortage(session, "ORD-1847")
        assert report is not None
        assert report.requested_quantity == 5000
        assert report.production_required_units == 5000
        assert report.has_shortage is True
        assert report.primary_shortage_material == "API-004"
        assert report.primary_shortage_amount == 700.0


@pytest.mark.asyncio
async def test_supplier_service_deterministic_scoring_and_policy():
    async with AsyncSessionLocal() as session:
        report = await SupplierService.recommend_supplier(
            session=session,
            material_code="API-004",
            required_quantity=1500.0,
            deadline_str="2026-10-15",
        )
        assert report is not None
        assert report.recommended_supplier is not None
        # Verify unapproved supplier SUP-002 was excluded from eligible list
        eligible_codes = [c.supplier_code for c in report.eligible_candidates]
        assert "SUP-002" not in eligible_codes
        # Verify SUP-001 or SUP-004 is recommended
        assert report.recommended_supplier.supplier_code in ["SUP-001", "SUP-004"]


@pytest.mark.asyncio
async def test_production_capacity():
    async with AsyncSessionLocal() as session:
        cap = await ProductionService.check_capacity(session, "PRD-001", "2026-10-12")
        assert cap is not None
        assert cap.line_code == "LINE-1-STERILE"


@pytest.mark.asyncio
async def test_order_risk_service():
    async with AsyncSessionLocal() as session:
        risk = await RiskService.evaluate_order_risk(session, "ORD-1847")
        assert risk is not None
        assert risk.risk_level in ["HIGH", "CRITICAL"]
        assert risk.order_number == "ORD-1847"


@pytest.mark.asyncio
async def test_flagship_cascade_service():
    async with AsyncSessionLocal() as session:
        cascade = await CascadeService.run_flagship_cascade(session, "DELAY-2026-001")
        assert cascade is not None
        assert cascade.delay_code == "DELAY-2026-001"
        assert len(cascade.affected_batches) > 0
        assert len(cascade.affected_orders) > 0
        assert cascade.approval_required is True
        assert cascade.approval_role == "procurement_officer"
