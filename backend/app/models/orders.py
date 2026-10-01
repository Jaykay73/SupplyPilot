import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_code = Column(String, unique=True, index=True, nullable=False)  # e.g., CUST-001
    name = Column(String, nullable=False)  # e.g., Medix Global Logistics
    country = Column(String, nullable=False, default="DE")
    tier = Column(String, nullable=False, default="Tier-1")  # Tier-1, Tier-2, Government
    contact_email = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    orders = relationship("Order", back_populates="customer")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String, unique=True, index=True, nullable=False)  # e.g., ORD-1847
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    order_date = Column(DateTime, nullable=False)
    requested_delivery_date = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default="confirmed")  # pending, confirmed, in_production, fulfilled, at_risk, delayed, cancelled
    priority = Column(String, nullable=False, default="NORMAL")  # NORMAL, HIGH, CRITICAL
    currency = Column(String, nullable=False, default="EUR")
    total_amount = Column(Float, nullable=False, default=0.0)
    risk_level = Column(String, nullable=False, default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    risk_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    reservations = relationship("InventoryReservation", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    fulfilled_quantity = Column(Integer, nullable=False, default=0)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
