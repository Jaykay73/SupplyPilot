import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sku = Column(String, unique=True, index=True, nullable=False)  # e.g., PRD-001
    name = Column(String, nullable=False)  # e.g., Paracetamol IV Solution 10mg/ml
    category = Column(String, nullable=False)  # Sterile Injectable, Solid Oral, Liquid Oral
    unit = Column(String, nullable=False, default="vials")  # vials, tablets, bottles
    production_time_hours = Column(Float, nullable=False, default=24.0)
    safety_stock = Column(Integer, nullable=False, default=1000)
    standard_batch_size = Column(Integer, nullable=False, default=5000)
    unit_price = Column(Float, nullable=False, default=12.50)  # Sales price in EUR
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    materials = relationship("ProductMaterial", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")
    inventory = relationship("Inventory", back_populates="product", uselist=False)


class RawMaterial(Base):
    __tablename__ = "raw_materials"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    material_code = Column(String, unique=True, index=True, nullable=False)  # e.g., API-004
    name = Column(String, nullable=False)  # e.g., Paracetamol Pure Grade Active API
    category = Column(String, nullable=False)  # API, Excipient, Solvent, Packaging, Closure
    unit = Column(String, nullable=False, default="kg")  # kg, liters, units
    safety_stock = Column(Float, nullable=False, default=500.0)
    standard_cost_per_unit = Column(Float, nullable=False, default=5.60)  # Standard procurement cost
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    product_associations = relationship("ProductMaterial", back_populates="material")
    supplier_links = relationship("SupplierMaterial", back_populates="material")
    inventory = relationship("Inventory", back_populates="material", uselist=False)


class ProductMaterial(Base):
    """Bill of Materials (BOM) association."""
    __tablename__ = "product_materials"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    material_id = Column(String, ForeignKey("raw_materials.id", ondelete="CASCADE"), nullable=False)
    quantity_required_per_unit = Column(Float, nullable=False)  # Material required per finished unit
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    product = relationship("Product", back_populates="materials")
    material = relationship("RawMaterial", back_populates="product_associations")
