from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.models.approvals import ApprovalRequest, ApprovalEvent
from backend.app.models.actions import PurchaseRequest, ProductionChangeRequest, CustomerCommunication
from backend.app.models.audit import AuditEvent
from backend.app.models.users import User
from backend.app.rules.rules_engine import RulesEngine
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/approvals", tags=["Approval Center"])


class ApprovalActionResponse(BaseModel):
    approval_id: str
    status: str
    message: str
    resolved_by: str
    resolved_at: str


class RejectRequest(BaseModel):
    reason: str


@router.get("")
async def list_approvals(
    status_filter: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
):
    query = select(ApprovalRequest).order_by(ApprovalRequest.created_at.desc())
    if status_filter:
        query = query.where(ApprovalRequest.status == status_filter)
    res = await session.execute(query)
    approvals = res.scalars().all()
    return [
        {
            "id": a.id,
            "request_number": a.request_number,
            "action_type": a.action_type,
            "action_summary": a.action_summary,
            "monetary_value": a.monetary_value,
            "currency": a.currency,
            "required_role": a.required_role,
            "risk_level": a.risk_level,
            "jev_recommendation": a.jev_recommendation,
            "supporting_evidence": a.supporting_evidence,
            "policy_citations": a.policy_citations,
            "status": a.status,
            "agent_run_id": a.agent_run_id,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
            "resolved_by": a.resolved_by,
        }
        for a in approvals
    ]


@router.get("/{approval_id}")
async def get_approval(
    approval_id: str,
    session: AsyncSession = Depends(get_db),
):
    query = select(ApprovalRequest).options(selectinload(ApprovalRequest.events)).where(ApprovalRequest.id == approval_id)
    res = await session.execute(query)
    app_req = res.scalar_one_or_none()
    if not app_req:
        raise HTTPException(status_code=404, detail="Approval request not found")
    return app_req


@router.post("/{approval_id}/approve", response_model=ApprovalActionResponse)
async def approve_request(
    approval_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    query = select(ApprovalRequest).where(ApprovalRequest.id == approval_id)
    res = await session.execute(query)
    app_req = res.scalar_one_or_none()
    if not app_req:
        raise HTTPException(status_code=404, detail="Approval request not found")

    if app_req.status != "PENDING":
        raise HTTPException(status_code=400, detail=f"Request is already in '{app_req.status}' state.")

    # Enforce authoritative RBAC check
    caller_role = user.roles[0].name if user.roles else "viewer"
    is_authorized = RulesEngine.can_role_approve(caller_role, app_req.required_role)
    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Authorization failure: Role '{caller_role}' cannot approve an action requiring '{app_req.required_role}'."
        )

    now = datetime.now(timezone.utc)
    app_req.status = "APPROVED"
    app_req.resolved_at = now
    app_req.resolved_by = user.email

    # Mutate underlying target record
    if app_req.action_type == "PURCHASE_REQUEST":
        pr_res = await session.execute(select(PurchaseRequest).where(PurchaseRequest.id == app_req.target_id))
        pr = pr_res.scalar_one_or_none()
        if pr:
            pr.status = "APPROVED"
            pr.executed_at = now
    elif app_req.action_type == "PRODUCTION_RESCHEDULE":
        pcr_res = await session.execute(select(ProductionChangeRequest).where(ProductionChangeRequest.id == app_req.target_id))
        pcr = pcr_res.scalar_one_or_none()
        if pcr:
            pcr.status = "APPROVED"
    elif app_req.action_type == "CUSTOMER_COMMUNICATION":
        comm_res = await session.execute(select(CustomerCommunication).where(CustomerCommunication.id == app_req.target_id))
        comm = comm_res.scalar_one_or_none()
        if comm:
            comm.status = "APPROVED"

    # Add Approval Event
    app_event = ApprovalEvent(
        approval_request_id=app_req.id,
        actor_id=user.id,
        actor_role=caller_role,
        event_type="APPROVED",
        reason="Human reviewer authorized action after review of evidence and policy.",
    )
    session.add(app_event)

    # Add Immutable Audit Event
    audit = AuditEvent(
        actor_id=user.id,
        actor_name=user.full_name,
        actor_role=caller_role,
        action=f"APPROVE_{app_req.action_type}",
        target_type=app_req.action_type.lower(),
        target_id=app_req.target_id,
        reason=f"Approved action {app_req.request_number} by {user.email}",
        status="COMPLETED",
        approval_id=app_req.id,
        agent_run_id=app_req.agent_run_id,
    )
    session.add(audit)
    await session.commit()

    return ApprovalActionResponse(
        approval_id=app_req.id,
        status="APPROVED",
        message="Action approved and executed successfully.",
        resolved_by=user.email,
        resolved_at=now.isoformat(),
    )


@router.post("/{approval_id}/reject", response_model=ApprovalActionResponse)
async def reject_request(
    approval_id: str,
    req: RejectRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    query = select(ApprovalRequest).where(ApprovalRequest.id == approval_id)
    res = await session.execute(query)
    app_req = res.scalar_one_or_none()
    if not app_req:
        raise HTTPException(status_code=404, detail="Approval request not found")

    if app_req.status != "PENDING":
        raise HTTPException(status_code=400, detail=f"Request is already in '{app_req.status}' state.")

    now = datetime.now(timezone.utc)
    app_req.status = "REJECTED"
    app_req.resolved_at = now
    app_req.resolved_by = user.email
    app_req.resolution_notes = req.reason

    # Mutate underlying target record
    if app_req.action_type == "PURCHASE_REQUEST":
        pr_res = await session.execute(select(PurchaseRequest).where(PurchaseRequest.id == app_req.target_id))
        pr = pr_res.scalar_one_or_none()
        if pr:
            pr.status = "REJECTED"

    # Add Approval Event
    caller_role = user.roles[0].name if user.roles else "viewer"
    app_event = ApprovalEvent(
        approval_request_id=app_req.id,
        actor_id=user.id,
        actor_role=caller_role,
        event_type="REJECTED",
        reason=req.reason,
    )
    session.add(app_event)

    # Add Immutable Audit Event
    audit = AuditEvent(
        actor_id=user.id,
        actor_name=user.full_name,
        actor_role=caller_role,
        action=f"REJECT_{app_req.action_type}",
        target_type=app_req.action_type.lower(),
        target_id=app_req.target_id,
        reason=f"Rejected: {req.reason}",
        status="REJECTED",
        approval_id=app_req.id,
        agent_run_id=app_req.agent_run_id,
    )
    session.add(audit)
    await session.commit()

    return ApprovalActionResponse(
        approval_id=app_req.id,
        status="REJECTED",
        message="Action rejected.",
        resolved_by=user.email,
        resolved_at=now.isoformat(),
    )
