from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.audit import AuditEvent


class AuditService:
    @staticmethod
    async def record_event(
        session: AsyncSession,
        actor_id: str,
        actor_name: str,
        actor_role: str,
        action: str,
        target_type: str,
        target_id: str,
        reason: str,
        status: str = "COMPLETED",
        agent_run_id: Optional[str] = None,
        approval_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> AuditEvent:
        event = AuditEvent(
            actor_id=actor_id,
            actor_name=actor_name,
            actor_role=actor_role,
            action=action,
            target_type=target_type,
            target_id=target_id,
            reason=reason,
            status=status,
            agent_run_id=agent_run_id,
            approval_id=approval_id,
            details=details or {},
        )
        session.add(event)
        await session.commit()
        await session.refresh(event)
        return event

    @staticmethod
    async def list_recent_events(session: AsyncSession, limit: int = 50):
        query = select(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(limit)
        res = await session.execute(query)
        return res.scalars().all()
