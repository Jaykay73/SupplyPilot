from typing import Optional, List
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.orders import Order, OrderItem
from backend.app.models.catalogue import Product, RawMaterial, ProductMaterial
from backend.app.models.inventory import Inventory
from backend.app.schemas.operations import MaterialShortageReport, MaterialRequirementItem


class BOMService:
    @staticmethod
    async def calculate_material_shortage(session: AsyncSession, order_identifier: str) -> Optional[MaterialShortageReport]:
        # Retrieve order
        order_res = await session.execute(
            select(Order)
            .options(selectinload(Order.items).selectinload(OrderItem.product))
            .where((Order.order_number == order_identifier) | (Order.id == order_identifier))
        )
        order = order_res.scalar_one_or_none()
        if not order or not order.items:
            return None

        # Analyze primary product in order
        item = order.items[0]
        product = item.product
        requested_qty = item.quantity

        # 1. Check finished goods inventory
        fg_inv_res = await session.execute(
            select(Inventory).where(Inventory.product_id == product.id)
        )
        fg_inv = fg_inv_res.scalar_one_or_none()
        fg_available = fg_inv.available if fg_inv else 0.0

        # Calculate production requirement based on standard batch sizing
        net_deficit = max(0, requested_qty - int(fg_available))
        if net_deficit > 0:
            # In pharmaceutical manufacturing, production runs in discrete standard batch sizes
            batches_needed = (net_deficit + product.standard_batch_size - 1) // product.standard_batch_size
            production_required = batches_needed * product.standard_batch_size
        else:
            production_required = 0

        # 2. Retrieve Bill of Materials
        bom_res = await session.execute(
            select(ProductMaterial, RawMaterial)
            .join(RawMaterial, ProductMaterial.material_id == RawMaterial.id)
            .where(ProductMaterial.product_id == product.id)
        )
        bom_rows = bom_res.all()

        requirements: List[MaterialRequirementItem] = []
        has_shortage = False
        primary_shortage_material = None
        max_shortage_amount = 0.0

        for pm, rm in bom_rows:
            needed_qty = pm.quantity_required_per_unit * production_required

            # Query material inventory
            m_inv_res = await session.execute(
                select(Inventory).where(Inventory.material_id == rm.id)
            )
            m_inv = m_inv_res.scalar_one_or_none()
            m_on_hand = m_inv.on_hand if m_inv else 0.0
            m_available = m_inv.available if m_inv else 0.0

            shortage = max(0.0, needed_qty - m_available)
            if shortage > 0:
                has_shortage = True
                if shortage > max_shortage_amount:
                    max_shortage_amount = shortage
                    primary_shortage_material = rm.material_code

            requirements.append(MaterialRequirementItem(
                material_code=rm.material_code,
                material_name=rm.name,
                quantity_required=needed_qty,
                unit=rm.unit,
                on_hand=m_on_hand,
                available=m_available,
                shortage=shortage,
                safety_stock=rm.safety_stock,
            ))

        return MaterialShortageReport(
            order_number=order.order_number,
            product_sku=product.sku,
            requested_quantity=requested_qty,
            finished_goods_available=fg_available,
            production_required_units=production_required,
            requirements=requirements,
            has_shortage=has_shortage,
            primary_shortage_material=primary_shortage_material,
            primary_shortage_amount=max_shortage_amount if has_shortage else 0.0,
        )
