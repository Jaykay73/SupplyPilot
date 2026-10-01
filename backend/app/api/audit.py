from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.models.audit import AuditEvent

router = APIRouter(prefix="/audit", tags=["Audit Trail"])


@router.get("")
async def list_audit_events(limit: int = 50, session: AsyncSession = Depends(get_db)):
    res = await session.execute(
        select(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(limit)
    )
    events = res.scalars().all()
    return [
        {
            "id": e.id,
            "actor_id": e.actor_id,
            "actor_name": e.actor_name,
            "actor_role": e.actor_role,
            "action": e.action,
            "target_type": e.target_type,
            "target_id": e.target_id,
            "reason": e.reason,
            "status": e.status,
            "agent_run_id": e.agent_run_id,
            "approval_id": e.approval_id,
            "created_at": e.created_at.isoformat() if e.created_at else None,
            "details": e.details,
        }
        for e in events
    ]
