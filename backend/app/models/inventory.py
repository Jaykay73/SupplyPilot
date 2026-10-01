import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id", ondelete="CASCADE"), nullable=True, unique=True)
    material_id = Column(String, ForeignKey("raw_materials.id", ondelete="CASCADE"), nullable=True, unique=True)
    on_hand = Column(Float, nullable=False, default=0.0)
    reserved = Column(Float, nullable=False, default=0.0)
    incoming = Column(Float, nullable=False, default=0.0)
    unit = Column(String, nullable=False, default="units")
    warehouse_location = Column(String, nullable=False, default="WH-MAIN-A")
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    product = relationship("Product", back_populates="inventory")
    material = relationship("RawMaterial", back_populates="inventory")
    reservations = relationship("InventoryReservation", back_populates="inventory")

    @property
    def available(self) -> float:
        """Deterministic calculated available inventory: on_hand - reserved."""
        return max(0.0, self.on_hand - self.reserved)


class InventoryReservation(Base):
    __tablename__ = "inventory_reservations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    inventory_id = Column(String, ForeignKey("inventory.id", ondelete="CASCADE"), nullable=False)
    order_id = Column(String, ForeignKey("orders.id", ondelete="CASCADE"), nullable=True)
    batch_id = Column(String, ForeignKey("production_batches.id", ondelete="CASCADE"), nullable=True)
    quantity = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="active")  # active, released, consumed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    inventory = relationship("Inventory", back_populates="reservations")
    order = relationship("Order", back_populates="reservations")
    batch = relationship("ProductionBatch", back_populates="reservations")
