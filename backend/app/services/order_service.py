from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.orders import Order, OrderItem, Customer
from backend.app.schemas.operations import OrderSummary, OrderItemSummary


class OrderService:
    @staticmethod
    async def get_order(session: AsyncSession, order_identifier: str) -> Optional[OrderSummary]:
        query = (
            select(Order)
            .options(selectinload(Order.customer), selectinload(Order.items).selectinload(OrderItem.product))
            .where((Order.order_number == order_identifier) | (Order.id == order_identifier))
        )
        res = await session.execute(query)
        order = res.scalar_one_or_none()
        if not order:
            return None

        items_summary = [
            OrderItemSummary(
                product_sku=item.product.sku,
                product_name=item.product.name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                fulfilled_quantity=item.fulfilled_quantity,
            )
            for item in order.items
        ]

        return OrderSummary(
            order_id=order.id,
            order_number=order.order_number,
            customer_id=order.customer_id,
            customer_name=order.customer.name,
            customer_code=order.customer.customer_code,
            order_date=order.order_date.strftime("%Y-%m-%d"),
            requested_delivery_date=order.requested_delivery_date.strftime("%Y-%m-%d"),
            status=order.status,
            priority=order.priority,
            currency=order.currency,
            total_amount=order.total_amount,
            risk_level=order.risk_level,
            risk_reason=order.risk_reason,
            items=items_summary,
        )

    @staticmethod
    async def list_orders(session: AsyncSession, status: Optional[str] = None, limit: int = 50) -> List[OrderSummary]:
        query = (
            select(Order)
            .options(selectinload(Order.customer), selectinload(Order.items).selectinload(OrderItem.product))
            .order_by(Order.requested_delivery_date.asc())
            .limit(limit)
        )
        if status:
            query = query.where(Order.status == status)

        res = await session.execute(query)
        orders = res.scalars().all()
        result = []
        for o in orders:
            result.append(OrderSummary(
                order_id=o.id,
                order_number=o.order_number,
                customer_id=o.customer_id,
                customer_name=o.customer.name,
                customer_code=o.customer.customer_code,
                order_date=o.order_date.strftime("%Y-%m-%d"),
                requested_delivery_date=o.requested_delivery_date.strftime("%Y-%m-%d"),
                status=o.status,
                priority=o.priority,
                currency=o.currency,
                total_amount=o.total_amount,
                risk_level=o.risk_level,
                risk_reason=o.risk_reason,
                items=[
                    OrderItemSummary(
                        product_sku=item.product.sku,
                        product_name=item.product.name,
                        quantity=item.quantity,
                        unit_price=item.unit_price,
                        fulfilled_quantity=item.fulfilled_quantity,
                    )
                    for item in o.items
                ],
            ))
        return result

    @staticmethod
    async def get_at_risk_orders(session: AsyncSession) -> List[OrderSummary]:
        query = (
            select(Order)
            .options(selectinload(Order.customer), selectinload(Order.items).selectinload(OrderItem.product))
            .where(Order.risk_level.in_(["HIGH", "CRITICAL"]))
            .order_by(Order.requested_delivery_date.asc())
        )
        res = await session.execute(query)
        orders = res.scalars().all()
        return [
            OrderSummary(
                order_id=o.id,
                order_number=o.order_number,
                customer_id=o.customer_id,
                customer_name=o.customer.name,
                customer_code=o.customer.customer_code,
                order_date=o.order_date.strftime("%Y-%m-%d"),
                requested_delivery_date=o.requested_delivery_date.strftime("%Y-%m-%d"),
                status=o.status,
                priority=o.priority,
                currency=o.currency,
                total_amount=o.total_amount,
                risk_level=o.risk_level,
                risk_reason=o.risk_reason,
                items=[
                    OrderItemSummary(
                        product_sku=item.product.sku,
                        product_name=item.product.name,
                        quantity=item.quantity,
                        unit_price=item.unit_price,
                        fulfilled_quantity=item.fulfilled_quantity,
                    )
                    for item in o.items
                ],
            )
            for o in orders
        ]
