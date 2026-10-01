import json
from typing import Dict, Any, List, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.services.inventory_service import InventoryService
from backend.app.services.order_service import OrderService
from backend.app.services.bom_service import BOMService
from backend.app.services.supplier_service import SupplierService
from backend.app.services.production_service import ProductionService
from backend.app.services.risk_service import RiskService
from backend.app.models.orders import Customer
from backend.app.models.suppliers import Supplier


async def get_order_tool(session: AsyncSession, order_id: str) -> Dict[str, Any]:
    """Retrieves operational order status, customer details, and requested deadline."""
    order = await OrderService.get_order(session, order_id)
    if not order:
        return {"error": "Information unavailable", "detail": f"Order {order_id} not found in database."}
    return order.model_dump()


async def get_customer_tool(session: AsyncSession, customer_id: str) -> Dict[str, Any]:
    """Retrieves customer tier, contact details, and country."""
    query = select(Customer).where((Customer.customer_code == customer_id) | (Customer.id == customer_id))
    res = await session.execute(query)
    c = res.scalar_one_or_none()
    if not c:
        return {"error": "Information unavailable", "detail": f"Customer {customer_id} not found."}
    return {
        "customer_id": c.id,
        "customer_code": c.customer_code,
        "name": c.name,
        "country": c.country,
        "tier": c.tier,
        "contact_email": c.contact_email,
    }


async def check_inventory_tool(session: AsyncSession, item_id: str) -> Dict[str, Any]:
    """Checks inventory quantities (on_hand, reserved, available, incoming) for a product SKU or raw material code."""
    # Try product first
    p_inv = await InventoryService.get_product_inventory(session, item_id)
    if p_inv:
        return p_inv.model_dump()
    # Try raw material
    m_inv = await InventoryService.get_material_inventory(session, item_id)
    if m_inv:
        return m_inv.model_dump()
    return {"error": "Information unavailable", "detail": f"Item {item_id} not found in inventory records."}


async def get_open_orders_tool(session: AsyncSession) -> List[Dict[str, Any]]:
    """Retrieves open orders currently confirmed or in production."""
    orders = await OrderService.list_orders(session, limit=25)
    return [o.model_dump() for o in orders]


async def get_at_risk_orders_tool(session: AsyncSession) -> List[Dict[str, Any]]:
    """Retrieves all orders flagged as HIGH or CRITICAL risk."""
    risks = await RiskService.list_all_order_risks(session)
    return [r.model_dump() for r in risks if r.risk_level in ["HIGH", "CRITICAL"]]


async def check_production_capacity_tool(session: AsyncSession, product_sku: str, target_date: str) -> Dict[str, Any]:
    """Checks manufacturing line availability and scheduled hours on a given target date."""
    cap = await ProductionService.check_capacity(session, product_sku, target_date)
    if not cap:
        return {"error": "Information unavailable", "detail": f"Product {product_sku} or line capacity not found."}
    return cap.model_dump()


async def find_suppliers_tool(session: AsyncSession, material_code: str, required_quantity: float, deadline: str) -> Dict[str, Any]:
    """Discovers and evaluates qualified suppliers for a material based on lead time, reliability, and price."""
    rec = await SupplierService.recommend_supplier(session, material_code, required_quantity, deadline)
    return rec.model_dump()


async def get_supplier_details_tool(session: AsyncSession, supplier_code: str) -> Dict[str, Any]:
    """Retrieves supplier background, quality status, and reliability scorecard."""
    query = select(Supplier).where((Supplier.supplier_code == supplier_code) | (Supplier.id == supplier_code))
    res = await session.execute(query)
    sup = res.scalar_one_or_none()
    if not sup:
        return {"error": "Information unavailable", "detail": f"Supplier {supplier_code} not found."}
    return {
        "supplier_id": sup.id,
        "supplier_code": sup.supplier_code,
        "name": sup.name,
        "country": sup.country,
        "reliability_score": sup.overall_reliability_score,
        "status": sup.status,
        "contact_email": sup.contact_email,
    }


async def calculate_material_shortage_tool(session: AsyncSession, order_id: str) -> Dict[str, Any]:
    """Analyzes finished product deficit and explodes BOM to identify component raw material shortages."""
    report = await BOMService.calculate_material_shortage(session, order_id)
    if not report:
        return {"error": "Information unavailable", "detail": f"Order {order_id} not found or has no items."}
    return report.model_dump()
