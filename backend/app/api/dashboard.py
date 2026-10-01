from fastapi import APIRouter, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.models.orders import Order
from backend.app.models.approvals import ApprovalRequest
from backend.app.models.suppliers import SupplierDelay
from backend.app.models.production import ProductionBatch
from backend.app.models.tracing import AgentRun
from backend.app.services.risk_service import RiskService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
async def get_dashboard_summary(session: AsyncSession = Depends(get_db)):
    # 1. Orders count
    orders_res = await session.execute(select(Order))
    all_orders = orders_res.scalars().all()
    open_orders_count = len([o for o in all_orders if o.status not in ["fulfilled", "cancelled"]])

    # 2. Risk assessment
    at_risk_orders = await RiskService.list_all_order_risks(session)
    at_risk_count = len([o for o in at_risk_orders if o.risk_level in ["HIGH", "CRITICAL"]])

    # 3. Pending approvals
    app_res = await session.execute(select(ApprovalRequest).where(ApprovalRequest.status == "PENDING"))
    pending_approvals = app_res.scalars().all()

    # 4. Active delays
    delay_res = await session.execute(select(SupplierDelay).where(SupplierDelay.status == "REPORTED"))
    delays = delay_res.scalars().all()

    # 5. Batches
    batch_res = await session.execute(select(ProductionBatch))
    batches = batch_res.scalars().all()

    # 6. Recent runs
    run_res = await session.execute(select(AgentRun).order_by(AgentRun.created_at.desc()).limit(5))
    recent_runs = run_res.scalars().all()

    return {
        "kpis": {
            "orders_at_risk": at_risk_count,
            "open_orders": open_orders_count,
            "pending_approvals": len(pending_approvals),
            "supplier_delays": len(delays),
            "scheduled_production_batches": len(batches),
        },
        "orders_at_risk": [o.model_dump() for o in at_risk_orders[:10]],
        "pending_approvals": [
            {
                "id": a.id,
                "request_number": a.request_number,
                "action_type": a.action_type,
                "action_summary": a.action_summary,
                "monetary_value": a.monetary_value,
                "required_role": a.required_role,
                "risk_level": a.risk_level,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in pending_approvals[:5]
        ],
        "recent_agent_runs": [
            {
                "id": r.id,
                "goal": r.goal,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in recent_runs
        ],
    }
