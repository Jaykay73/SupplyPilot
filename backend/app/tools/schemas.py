from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


# --- Read Tool Inputs ---
class GetOrderInput(BaseModel):
    order_id: str = Field(description="Order number (e.g. 'ORD-1847') or order UUID")


class GetCustomerInput(BaseModel):
    customer_id: str = Field(description="Customer code (e.g. 'CUST-001') or customer UUID")


class CheckInventoryInput(BaseModel):
    item_id: str = Field(description="Product SKU (e.g. 'PRD-001') or raw material code (e.g. 'API-004')")


class CheckProductionCapacityInput(BaseModel):
    product_sku: str = Field(description="Product SKU (e.g. 'PRD-001')")
    target_date: str = Field(description="Target date in YYYY-MM-DD format (e.g. '2026-10-12')")


class FindSuppliersInput(BaseModel):
    material_code: str = Field(description="Material code (e.g. 'API-004')")
    required_quantity: float = Field(description="Required quantity in kg/units")
    deadline: str = Field(description="Required arrival date in YYYY-MM-DD format")


class GetSupplierDetailsInput(BaseModel):
    supplier_code: str = Field(description="Supplier code (e.g. 'SUP-001') or supplier UUID")


class CalculateMaterialShortageInput(BaseModel):
    order_id: str = Field(description="Order number (e.g. 'ORD-1847')")


# --- Action Tool Inputs ---
class CreatePurchaseRequestInput(BaseModel):
    material_code: str = Field(description="Material code to procure (e.g. 'API-004')")
    supplier_code: str = Field(description="Selected qualified supplier code (e.g. 'SUP-001')")
    quantity: float = Field(description="Quantity to purchase in units/kg")
    estimated_cost: float = Field(description="Estimated procurement cost in EUR")
    reason: str = Field(description="Operational justification for the purchase request")
    order_id: Optional[str] = Field(default=None, description="Linked customer order number if applicable")
    idempotency_key: Optional[str] = Field(default=None, description="Client idempotency key")


class RescheduleProductionInput(BaseModel):
    batch_number: str = Field(description="Production batch number (e.g. 'BATCH-2026-104')")
    new_start_date: str = Field(description="Proposed start date in YYYY-MM-DD format")
    reason: str = Field(description="Justification for schedule adjustment")
    idempotency_key: Optional[str] = Field(default=None, description="Client idempotency key")


class PrepareCustomerCommunicationInput(BaseModel):
    order_id: str = Field(description="Order number (e.g. 'ORD-1847')")
    recipient: str = Field(description="Customer email address")
    subject: str = Field(description="Email subject line")
    body: str = Field(description="Email draft body text")
    idempotency_key: Optional[str] = Field(default=None, description="Client idempotency key")


class ActionProposalResult(BaseModel):
    action_type: str
    action_id: str
    action_summary: str
    monetary_value: float
    currency: str
    status: str  # "PENDING_APPROVAL" | "AUTO_EXECUTED" | "BLOCKED"
    required_role: str
    reason: str
    supporting_evidence: Dict[str, Any]
