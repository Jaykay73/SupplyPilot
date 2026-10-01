import uuid
import pytest
from backend.app.db.session import AsyncSessionLocal
import backend.app.db.base
from backend.app.tools.read_tools import (
    get_order_tool,
    check_inventory_tool,
    find_suppliers_tool,
    calculate_material_shortage_tool,
    check_production_capacity_tool,
)
from backend.app.tools.action_tools import (
    create_purchase_request_tool,
    reschedule_production_tool,
)


@pytest.mark.asyncio
async def test_get_order_tool_valid_and_missing():
    async with AsyncSessionLocal() as session:
        # Existing order
        ord_res = await get_order_tool(session, "ORD-1847")
        assert "error" not in ord_res
        assert ord_res["order_number"] == "ORD-1847"
        assert ord_res["customer_name"] == "Medix Global Logistics"

        # Missing order - must return Information unavailable rather than hallucinating
        missing = await get_order_tool(session, "ORD-99999")
        assert missing.get("error") == "Information unavailable"


@pytest.mark.asyncio
async def test_check_inventory_tool():
    async with AsyncSessionLocal() as session:
        # Product
        p_inv = await check_inventory_tool(session, "PRD-001")
        assert "error" not in p_inv
        assert p_inv["available"] == 3100.0

        # Material
        m_inv = await check_inventory_tool(session, "API-004")
        assert "error" not in m_inv
        assert m_inv["available"] == 800.0


@pytest.mark.asyncio
async def test_find_suppliers_tool():
    async with AsyncSessionLocal() as session:
        sup_res = await find_suppliers_tool(session, "API-004", 1500.0, "2026-10-15")
        assert "error" not in sup_res
        assert sup_res["recommended_supplier"] is not None
        assert sup_res["recommended_supplier"]["supplier_code"] in ["SUP-001", "SUP-004"]


@pytest.mark.asyncio
async def test_action_tools_and_idempotency():
    async with AsyncSessionLocal() as session:
        idem = f"TEST-IDEM-{uuid.uuid4().hex[:8]}"
        res1 = await create_purchase_request_tool(
            session=session,
            material_code="API-004",
            supplier_code="SUP-001",
            quantity=1500.0,
            estimated_cost=8400.0,
            reason="Medix Order Fulfillment API-004 Shortage",
            order_id="ORD-1847",
            idempotency_key=idem,
            user_role="procurement_officer",
        )
        assert res1["action_type"] == "PURCHASE_REQUEST"
        assert res1["monetary_value"] == 8400.0
        assert res1["status"] == "PENDING_APPROVAL"
        assert res1["required_role"] == "procurement_officer"

        # Test duplicate idempotency call
        res2 = await create_purchase_request_tool(
            session=session,
            material_code="API-004",
            supplier_code="SUP-001",
            quantity=1500.0,
            estimated_cost=8400.0,
            reason="Duplicate attempt",
            idempotency_key=idem,
        )
        assert res2["status"] == "DUPLICATE_DETECTED"
