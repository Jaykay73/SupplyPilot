import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.config import settings
from backend.app.models.catalogue import RawMaterial
from backend.app.models.suppliers import Supplier
from backend.app.models.orders import Order
from backend.app.models.production import ProductionBatch
from backend.app.models.actions import PurchaseRequest, ProductionChangeRequest, CustomerCommunication
from backend.app.models.approvals import ApprovalRequest
from backend.app.models.audit import AuditEvent
from backend.app.tools.schemas import ActionProposalResult


async def create_purchase_request_tool(
    session: AsyncSession,
    material_code: str,
    supplier_code: str,
    quantity: float,
    estimated_cost: float,
    reason: str,
    order_id: Optional[str] = None,
    idempotency_key: Optional[str] = None,
    user_role: str = "procurement_officer",
    agent_run_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Generates a procurement request and approval gate for raw materials."""
    idem_key = idempotency_key or f"PR-{uuid.uuid4().hex[:10]}"

    # Check idempotency
    existing_res = await session.execute(
        select(PurchaseRequest).where(PurchaseRequest.idempotency_key == idem_key)
    )
    existing = existing_res.scalar_one_or_none()
    if existing:
        return {
            "status": "DUPLICATE_DETECTED",
            "message": f"Action with idempotency key {idem_key} already registered.",
            "request_number": existing.request_number,
        }

    # Fetch material
    m_res = await session.execute(select(RawMaterial).where(RawMaterial.material_code == material_code))
    material = m_res.scalar_one_or_none()
    if not material:
        return {"error": "Invalid material", "detail": f"Material {material_code} not found."}

    # Fetch supplier
    s_res = await session.execute(select(Supplier).where(Supplier.supplier_code == supplier_code))
    supplier = s_res.scalar_one_or_none()
    if not supplier:
        return {"error": "Invalid supplier", "detail": f"Supplier {supplier_code} not found."}

    # Link order if present
    order_obj_id = None
    if order_id:
        o_res = await session.execute(select(Order).where((Order.order_number == order_id) | (Order.id == order_id)))
        order_obj = o_res.scalar_one_or_none()
        if order_obj:
            order_obj_id = order_obj.id

    req_number = f"PR-{datetime.now(timezone.utc).strftime('%y%m%d')}-{uuid.uuid4().hex[:4].upper()}"

    # Determine required approval role based on deterministic thresholds
    if estimated_cost <= settings.THRESHOLD_AUTO_EXECUTE_MAX:
        status = "APPROVED" if user_role in ["procurement_officer", "operations_manager", "admin"] else "PENDING_APPROVAL"
        required_role = "procurement_officer"
        risk_level = "LOW"
    elif estimated_cost <= settings.THRESHOLD_PROCUREMENT_MAX:
        status = "PENDING_APPROVAL"
        required_role = "procurement_officer"
        risk_level = "MEDIUM"
    else:
        status = "PENDING_APPROVAL"
        required_role = "operations_manager"
        risk_level = "HIGH"

    # Create PurchaseRequest record
    pr = PurchaseRequest(
        request_number=req_number,
        idempotency_key=idem_key,
        material_id=material.id,
        supplier_id=supplier.id,
        order_id=order_obj_id,
        quantity=quantity,
        unit=material.unit,
        estimated_cost=estimated_cost,
        currency="EUR",
        reason=reason,
        status=status,
        created_by="SupplyPilot Agent",
    )
    session.add(pr)
    await session.flush()

    # Create ApprovalRequest record
    app_number = f"APP-{uuid.uuid4().hex[:8].upper()}"
    app_req = ApprovalRequest(
        request_number=app_number,
        action_type="PURCHASE_REQUEST",
        target_id=pr.id,
        action_summary=f"Procure {quantity:,.0f} {material.unit} of {material.material_code} ({material.name}) from {supplier.name} for EUR {estimated_cost:,.2f}",
        monetary_value=estimated_cost,
        currency="EUR",
        required_role=required_role,
        risk_level=risk_level,
        supporting_evidence={
            "material_code": material.material_code,
            "supplier_code": supplier.supplier_code,
            "quantity": quantity,
            "estimated_cost": estimated_cost,
            "reason": reason,
            "order_number": order_id,
        },
        status="APPROVED" if status == "APPROVED" else "PENDING",
        agent_run_id=agent_run_id,
    )
    session.add(app_req)

    # Record Audit Event
    audit = AuditEvent(
        actor_id="AGENT",
        actor_name="SupplyPilot Agent",
        actor_role=user_role,
        action="CREATE_PURCHASE_REQUEST",
        target_type="purchase_request",
        target_id=pr.id,
        reason=reason,
        status=status,
        agent_run_id=agent_run_id,
        approval_id=app_req.id,
        details={"cost": estimated_cost, "supplier": supplier.supplier_code},
    )
    session.add(audit)
    await session.commit()

    return {
        "action_type": "PURCHASE_REQUEST",
        "action_id": pr.id,
        "request_number": pr.request_number,
        "approval_id": app_req.id,
        "action_summary": app_req.action_summary,
        "monetary_value": estimated_cost,
        "currency": "EUR",
        "status": status,
        "required_role": required_role,
        "risk_level": risk_level,
        "reason": reason,
    }


async def reschedule_production_tool(
    session: AsyncSession,
    batch_number: str,
    new_start_date: str,
    reason: str,
    idempotency_key: Optional[str] = None,
    user_role: str = "production_planner",
    agent_run_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Generates a production change request to adjust scheduled batch execution."""
    idem_key = idempotency_key or f"PCR-{uuid.uuid4().hex[:10]}"

    b_res = await session.execute(select(ProductionBatch).where(ProductionBatch.batch_number == batch_number))
    batch = b_res.scalar_one_or_none()
    if not batch:
        return {"error": "Invalid batch", "detail": f"Batch {batch_number} not found."}

    target_dt = datetime.strptime(new_start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    change_number = f"PCR-{uuid.uuid4().hex[:8].upper()}"

    pcr = ProductionChangeRequest(
        change_number=change_number,
        idempotency_key=idem_key,
        batch_id=batch.id,
        original_start_date=batch.scheduled_start_date,
        proposed_start_date=target_dt,
        reason=reason,
        status="PENDING_APPROVAL",
    )
    session.add(pcr)
    await session.flush()

    app_req = ApprovalRequest(
        request_number=f"APP-{uuid.uuid4().hex[:8].upper()}",
        action_type="PRODUCTION_RESCHEDULE",
        target_id=pcr.id,
        action_summary=f"Reschedule Batch {batch.batch_number} from {batch.scheduled_start_date.strftime('%Y-%m-%d')} to {new_start_date}",
        monetary_value=0.0,
        currency="EUR",
        required_role="operations_manager",
        risk_level="MEDIUM",
        supporting_evidence={"batch_number": batch.batch_number, "proposed_date": new_start_date, "reason": reason},
        status="PENDING",
        agent_run_id=agent_run_id,
    )
    session.add(app_req)
    await session.commit()

    return {
        "action_type": "PRODUCTION_RESCHEDULE",
        "action_id": pcr.id,
        "change_number": change_number,
        "approval_id": app_req.id,
        "action_summary": app_req.action_summary,
        "status": "PENDING_APPROVAL",
        "required_role": "operations_manager",
    }


async def prepare_customer_communication_tool(
    session: AsyncSession,
    order_id: str,
    recipient: str,
    subject: str,
    body: str,
    idempotency_key: Optional[str] = None,
    user_role: str = "operations_manager",
    agent_run_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Drafts simulated customer communication notification."""
    idem_key = idempotency_key or f"COMM-{uuid.uuid4().hex[:10]}"

    o_res = await session.execute(select(Order).where((Order.order_number == order_id) | (Order.id == order_id)))
    order = o_res.scalar_one_or_none()
    if not order:
        return {"error": "Invalid order", "detail": f"Order {order_id} not found."}

    comm = CustomerCommunication(
        comm_code=f"COMM-{uuid.uuid4().hex[:8].upper()}",
        idempotency_key=idem_key,
        order_id=order.id,
        recipient_email=recipient,
        subject=subject,
        body=body,
        is_simulated=True,
        status="PENDING_APPROVAL",
    )
    session.add(comm)
    await session.flush()

    app_req = ApprovalRequest(
        request_number=f"APP-{uuid.uuid4().hex[:8].upper()}",
        action_type="CUSTOMER_COMMUNICATION",
        target_id=comm.id,
        action_summary=f"Send simulated delay update to {recipient} regarding Order {order.order_number}",
        monetary_value=0.0,
        currency="EUR",
        required_role="operations_manager",
        risk_level="MEDIUM",
        supporting_evidence={"order_number": order.order_number, "subject": subject, "recipient": recipient},
        status="PENDING",
        agent_run_id=agent_run_id,
    )
    session.add(app_req)
    await session.commit()

    return {
        "action_type": "CUSTOMER_COMMUNICATION",
        "action_id": comm.id,
        "comm_code": comm.comm_code,
        "approval_id": app_req.id,
        "action_summary": app_req.action_summary,
        "status": "PENDING_APPROVAL",
        "required_role": "operations_manager",
    }
