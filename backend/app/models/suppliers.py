import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    supplier_code = Column(String, unique=True, index=True, nullable=False)  # e.g., SUP-001 (Apex BioChem)
    name = Column(String, nullable=False)
    country = Column(String, nullable=False, default="DE")
    overall_reliability_score = Column(Float, nullable=False, default=0.95)  # 0.00 to 1.00
    status = Column(String, nullable=False, default="ACTIVE")  # ACTIVE, RESTRICTED, SUSPENDED
    contact_email = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    materials = relationship("SupplierMaterial", back_populates="supplier")
    delays = relationship("SupplierDelay", back_populates="supplier")


class SupplierMaterial(Base):
    __tablename__ = "supplier_materials"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    supplier_id = Column(String, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False)
    material_id = Column(String, ForeignKey("raw_materials.id", ondelete="CASCADE"), nullable=False)
    unit_price = Column(Float, nullable=False)
    lead_time_days = Column(Integer, nullable=False, default=5)
    minimum_order_quantity = Column(Float, nullable=False, default=100.0)
    weekly_capacity = Column(Float, nullable=False, default=5000.0)
    qualification_status = Column(String, nullable=False, default="QUALIFIED")  # QUALIFIED, AUDIT_REQUIRED, RESTRICTED
    is_approved = Column(Boolean, nullable=False, default=True)  # Hard policy flag

    supplier = relationship("Supplier", back_populates="materials")
    material = relationship("RawMaterial", back_populates="supplier_links")


class SupplierDelay(Base):
    __tablename__ = "supplier_delays"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    delay_code = Column(String, unique=True, index=True, nullable=False)  # e.g., DELAY-2026-001
    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=False)
    material_id = Column(String, ForeignKey("raw_materials.id"), nullable=False)
    delay_days = Column(Integer, nullable=False)
    original_eta = Column(DateTime, nullable=False)
    revised_eta = Column(DateTime, nullable=False)
    reason = Column(String, nullable=False)
    status = Column(String, nullable=False, default="REPORTED")  # REPORTED, ANALYZED, MITIGATED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    supplier = relationship("Supplier", back_populates="delays")
    material = relationship("RawMaterial")
