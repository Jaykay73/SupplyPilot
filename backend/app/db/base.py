"""SQLAlchemy Base and model registry."""
from backend.app.db.session import Base
from backend.app.models.users import User, Role, user_roles
from backend.app.models.catalogue import Product, RawMaterial, ProductMaterial
from backend.app.models.orders import Customer, Order, OrderItem
from backend.app.models.inventory import Inventory, InventoryReservation
from backend.app.models.suppliers import Supplier, SupplierMaterial, SupplierDelay
from backend.app.models.production import ProductionBatch, ProductionLine, ProductionSchedule
from backend.app.models.actions import PurchaseRequest, ProductionChangeRequest, CustomerCommunication, OrderCancellation
from backend.app.models.approvals import ApprovalRequest, ApprovalEvent
from backend.app.models.tracing import AgentRun, AgentStep, AgentToolCall
from backend.app.models.audit import AuditEvent, UserMemory

__all__ = [
    "Base",
    "User",
    "Role",
    "user_roles",
    "Product",
    "RawMaterial",
    "ProductMaterial",
    "Customer",
    "Order",
    "OrderItem",
    "Inventory",
    "InventoryReservation",
    "Supplier",
    "SupplierMaterial",
    "SupplierDelay",
    "ProductionBatch",
    "ProductionLine",
    "ProductionSchedule",
    "PurchaseRequest",
    "ProductionChangeRequest",
    "CustomerCommunication",
    "OrderCancellation",
    "ApprovalRequest",
    "ApprovalEvent",
    "AgentRun",
    "AgentStep",
    "AgentToolCall",
    "AuditEvent",
    "UserMemory",
]
