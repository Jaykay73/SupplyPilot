import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class ProductionBatch(Base):
    __tablename__ = "production_batches"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    batch_number = Column(String, unique=True, index=True, nullable=False)  # e.g., BATCH-2026-104
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    target_quantity = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="SCHEDULED")  # SCHEDULED, IN_PROGRESS, BLOCKED, COMPLETED, CANCELLED
    scheduled_start_date = Column(DateTime, nullable=False)
    scheduled_end_date = Column(DateTime, nullable=False)
    line_id = Column(String, nullable=False, default="LINE-1-STERILE")
    block_reason = Column(String, nullable=True)  # e.g., Raw material API-004 delayed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    product = relationship("Product")
    reservations = relationship("InventoryReservation", back_populates="batch")


class ProductionLine(Base):
    __tablename__ = "production_lines"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    line_code = Column(String, unique=True, index=True, nullable=False)  # LINE-1-STERILE, LINE-2-TABLETS
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Sterile Injectable, Solid Oral
    daily_capacity_hours = Column(Float, nullable=False, default=16.0)  # 2 shifts of 8 hours
    efficiency_factor = Column(Float, nullable=False, default=0.90)


class ProductionSchedule(Base):
    __tablename__ = "production_schedule"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    line_code = Column(String, nullable=False, index=True)
    scheduled_date = Column(DateTime, nullable=False, index=True)
    hours_allocated = Column(Float, nullable=False, default=0.0)
    batch_id = Column(String, ForeignKey("production_batches.id"), nullable=True)
    notes = Column(String, nullable=True)
