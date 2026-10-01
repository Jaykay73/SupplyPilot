from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.catalogue import Product, RawMaterial
from backend.app.models.inventory import Inventory, InventoryReservation
from backend.app.schemas.operations import InventoryStatus


class InventoryService:
    @staticmethod
    async def get_product_inventory(session: AsyncSession, sku_or_id: str) -> Optional[InventoryStatus]:
        query = select(Product, Inventory).join(Inventory, Inventory.product_id == Product.id).where(
            (Product.sku == sku_or_id) | (Product.id == sku_or_id)
        )
        res = await session.execute(query)
        row = res.first()
        if not row:
            return None
        product, inv = row
        return InventoryStatus(
            item_id=product.id,
            item_code=product.sku,
            item_name=product.name,
            item_type="product",
            on_hand=inv.on_hand,
            reserved=inv.reserved,
            available=inv.available,
            incoming=inv.incoming,
            unit=inv.unit,
            warehouse_location=inv.warehouse_location,
            safety_stock=float(product.safety_stock),
            is_below_safety_stock=inv.available < product.safety_stock,
        )

    @staticmethod
    async def get_material_inventory(session: AsyncSession, code_or_id: str) -> Optional[InventoryStatus]:
        query = select(RawMaterial, Inventory).join(Inventory, Inventory.material_id == RawMaterial.id).where(
            (RawMaterial.material_code == code_or_id) | (RawMaterial.id == code_or_id)
        )
        res = await session.execute(query)
        row = res.first()
        if not row:
            return None
        mat, inv = row
        return InventoryStatus(
            item_id=mat.id,
            item_code=mat.material_code,
            item_name=mat.name,
            item_type="raw_material",
            on_hand=inv.on_hand,
            reserved=inv.reserved,
            available=inv.available,
            incoming=inv.incoming,
            unit=inv.unit,
            warehouse_location=inv.warehouse_location,
            safety_stock=float(mat.safety_stock),
            is_below_safety_stock=inv.available < mat.safety_stock,
        )

    @staticmethod
    async def list_all_inventory(session: AsyncSession, item_type: Optional[str] = None) -> List[InventoryStatus]:
        items: List[InventoryStatus] = []
        if item_type in (None, "product"):
            p_res = await session.execute(select(Product, Inventory).join(Inventory, Inventory.product_id == Product.id))
            for p, inv in p_res.all():
                items.append(InventoryStatus(
                    item_id=p.id,
                    item_code=p.sku,
                    item_name=p.name,
                    item_type="product",
                    on_hand=inv.on_hand,
                    reserved=inv.reserved,
                    available=inv.available,
                    incoming=inv.incoming,
                    unit=inv.unit,
                    warehouse_location=inv.warehouse_location,
                    safety_stock=float(p.safety_stock),
                    is_below_safety_stock=inv.available < p.safety_stock,
                ))

        if item_type in (None, "raw_material"):
            m_res = await session.execute(select(RawMaterial, Inventory).join(Inventory, Inventory.material_id == RawMaterial.id))
            for m, inv in m_res.all():
                items.append(InventoryStatus(
                    item_id=m.id,
                    item_code=m.material_code,
                    item_name=m.name,
                    item_type="raw_material",
                    on_hand=inv.on_hand,
                    reserved=inv.reserved,
                    available=inv.available,
                    incoming=inv.incoming,
                    unit=inv.unit,
                    warehouse_location=inv.warehouse_location,
                    safety_stock=float(m.safety_stock),
                    is_below_safety_stock=inv.available < m.safety_stock,
                ))
        return items
