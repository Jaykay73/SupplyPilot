from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.models.tracing import AgentRun, AgentStep, AgentToolCall
from backend.app.models.approvals import ApprovalRequest

router = APIRouter(prefix="/runs", tags=["Execution Tracing"])


@router.get("")
async def list_runs(limit: int = 20, session: AsyncSession = Depends(get_db)):
    res = await session.execute(
        select(AgentRun).order_by(AgentRun.created_at.desc()).limit(limit)
    )
    runs = res.scalars().all()
    return [
        {
            "id": r.id,
            "thread_id": r.thread_id,
            "goal": r.goal,
            "status": r.status,
            "user_role": r.user_role,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "completed_at": r.completed_at.isoformat() if r.completed_at else None,
        }
        for r in runs
    ]


@router.get("/{run_id}/trace")
async def get_run_trace(run_id: str, session: AsyncSession = Depends(get_db)):
    res = await session.execute(
        select(AgentRun)
        .options(selectinload(AgentRun.steps), selectinload(AgentRun.tool_calls))
        .where(AgentRun.id == run_id)
    )
    run = res.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    # Fetch associated approval request if exists
    app_res = await session.execute(
        select(ApprovalRequest).where(ApprovalRequest.agent_run_id == run_id)
    )
    approval = app_res.scalar_one_or_none()

    return {
        "run_id": run.id,
        "thread_id": run.thread_id,
        "goal": run.goal,
        "status": run.status,
        "user_role": run.user_role,
        "plan": run.plan or [],
        "created_at": run.created_at.isoformat() if run.created_at else None,
        "completed_at": run.completed_at.isoformat() if run.completed_at else None,
        "steps": [
            {
                "step_number": s.step_number,
                "description": s.description,
                "status": s.status,
                "duration_ms": s.duration_ms,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in run.steps
        ],
        "tool_calls": [
            {
                "tool_name": tc.tool_name,
                "input_args": tc.input_args,
                "output_result": tc.output_result,
                "status": tc.status,
                "duration_ms": tc.duration_ms,
            }
            for tc in run.tool_calls
        ],
        "approval": {
            "id": approval.id,
            "request_number": approval.request_number,
            "action_type": approval.action_type,
            "monetary_value": approval.monetary_value,
            "status": approval.status,
            "risk_level": approval.risk_level,
            "required_role": approval.required_role,
        } if approval else None,
    }
