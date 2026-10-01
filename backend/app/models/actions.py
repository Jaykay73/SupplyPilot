import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class PurchaseRequest(Base):
    __tablename__ = "purchase_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    request_number = Column(String, unique=True, index=True, nullable=False)  # PR-1832
    idempotency_key = Column(String, unique=True, index=True, nullable=False)
    material_id = Column(String, ForeignKey("raw_materials.id"), nullable=False)
    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=False)
    order_id = Column(String, ForeignKey("orders.id"), nullable=True)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False, default="kg")
    estimated_cost = Column(Float, nullable=False)
    currency = Column(String, nullable=False, default="EUR")
    reason = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="PENDING_APPROVAL")  # PENDING_APPROVAL, APPROVED, REJECTED, EXECUTED
    created_by = Column(String, nullable=False, default="SupplyPilot Agent")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    executed_at = Column(DateTime, nullable=True)

    material = relationship("RawMaterial")
    supplier = relationship("Supplier")
    order = relationship("Order")


class ProductionChangeRequest(Base):
    __tablename__ = "production_change_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    change_number = Column(String, unique=True, index=True, nullable=False)  # PCR-2026-001
    idempotency_key = Column(String, unique=True, index=True, nullable=False)
    batch_id = Column(String, ForeignKey("production_batches.id"), nullable=False)
    original_start_date = Column(DateTime, nullable=False)
    proposed_start_date = Column(DateTime, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="PENDING_APPROVAL")  # PENDING_APPROVAL, APPROVED, REJECTED, EXECUTED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    batch = relationship("ProductionBatch")


class CustomerCommunication(Base):
    __tablename__ = "customer_communications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    comm_code = Column(String, unique=True, index=True, nullable=False)  # COMM-2026-001
    idempotency_key = Column(String, unique=True, index=True, nullable=False)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    recipient_email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    is_simulated = Column(Boolean, nullable=False, default=True)  # Strictly simulated
    status = Column(String, nullable=False, default="PENDING_APPROVAL")  # DRAFT, PENDING_APPROVAL, APPROVED, DISPATCHED_SIMULATED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    order = relationship("Order")


class OrderCancellation(Base):
    __tablename__ = "order_cancellations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    idempotency_key = Column(String, unique=True, index=True, nullable=False)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="PENDING_APPROVAL")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    order = relationship("Order")
