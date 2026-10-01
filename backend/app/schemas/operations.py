from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class InventoryStatus(BaseModel):
    item_id: str
    item_code: str
    item_name: str
    item_type: str  # "product" | "raw_material"
    on_hand: float
    reserved: float
    available: float
    incoming: float
    unit: str
    warehouse_location: str
    safety_stock: float
    is_below_safety_stock: bool


class OrderItemSummary(BaseModel):
    product_sku: str
    product_name: str
    quantity: int
    unit_price: float
    fulfilled_quantity: int


class OrderSummary(BaseModel):
    order_id: str
    order_number: str
    customer_id: str
    customer_name: str
    customer_code: str
    order_date: str
    requested_delivery_date: str
    status: str
    priority: str
    currency: str
    total_amount: float
    risk_level: str
    risk_reason: Optional[str] = None
    items: List[OrderItemSummary] = []


class MaterialRequirementItem(BaseModel):
    material_code: str
    material_name: str
    quantity_required: float
    unit: str
    on_hand: float
    available: float
    shortage: float
    safety_stock: float


class MaterialShortageReport(BaseModel):
    order_number: str
    product_sku: str
    requested_quantity: int
    finished_goods_available: float
    production_required_units: int
    requirements: List[MaterialRequirementItem]
    has_shortage: bool
    primary_shortage_material: Optional[str] = None
    primary_shortage_amount: Optional[float] = None


class SupplierCandidate(BaseModel):
    supplier_id: str
    supplier_code: str
    supplier_name: str
    unit_price: float
    lead_time_days: int
    can_meet_deadline: bool
    estimated_arrival_date: str
    reliability_score: float
    weekly_capacity: float
    is_approved: bool
    composite_score: float
    total_cost: float
    recommendation_reason: str


class SupplierRecommendationReport(BaseModel):
    material_code: str
    material_name: str
    required_quantity: float
    unit: str
    deadline: str
    recommended_supplier: Optional[SupplierCandidate] = None
    eligible_candidates: List[SupplierCandidate] = []
    unapproved_candidates: List[Dict[str, Any]] = []
    policy_notes: List[str] = []


class ProductionCapacityCheck(BaseModel):
    product_sku: str
    line_code: str
    line_name: str
    target_date: str
    hours_required: float
    hours_available: float
    has_capacity: bool
    scheduled_batches: List[Dict[str, Any]] = []


class OrderRiskItem(BaseModel):
    order_id: str
    order_number: str
    customer_name: str
    product_name: str
    requested_quantity: int
    requested_delivery_date: str
    risk_level: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    primary_risk_reason: str
    affected_material: Optional[str] = None
    recommended_action: str


class DelayCascadeItem(BaseModel):
    step: str
    entity_type: str
    entity_code: str
    description: str
    impact: str


class FlagshipCascadeReport(BaseModel):
    delay_code: str
    supplier_name: str
    material_code: str
    delay_days: int
    affected_batches: List[Dict[str, Any]]
    affected_orders: List[Dict[str, Any]]
    alternative_suppliers: List[SupplierCandidate]
    recommended_supplier: Optional[SupplierCandidate]
    reschedule_plan: Dict[str, Any]
    customer_communication_draft: Dict[str, Any]
    approval_required: bool
    approval_role: str
    estimated_cost: float
