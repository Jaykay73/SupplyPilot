import uuid
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from backend.app.agent.workflow import agent_app
from backend.app.models.users import User
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/chat", tags=["Agent Chat"])


class ChatMessageRequest(BaseModel):
    message: str
    thread_id: Optional[str] = None


class ChatMessageResponse(BaseModel):
    run_id: str
    thread_id: str
    response: str
    plan: List[str]
    retrieved_evidence: Dict[str, Any]
    policy_citations: List[Dict[str, Any]]
    proposed_action: Optional[Dict[str, Any]] = None
    jev_evaluation: Optional[Dict[str, Any]] = None
    rule_evaluation: Optional[Dict[str, Any]] = None
    approval_required: bool
    approval_id: Optional[str] = None
    status: str


@router.post("/messages", response_model=ChatMessageResponse)
async def post_chat_message(
    req: ChatMessageRequest,
    user: User = Depends(get_current_user),
):
    thread_id = req.thread_id or str(uuid.uuid4())
    run_id = str(uuid.uuid4())
    user_primary_role = user.roles[0].name if user.roles else "procurement_officer"

    initial_state = {
        "run_id": run_id,
        "thread_id": thread_id,
        "user_id": user.id,
        "user_role": user_primary_role,
        "goal": req.message,
        "messages": [],
        "plan": [],
        "current_step": 0,
        "retrieved_evidence": {},
        "policy_citations": [],
        "proposed_action": None,
        "jev_evaluation": None,
        "rule_evaluation": None,
        "approval_required": False,
        "approval_id": None,
        "approval_status": None,
        "final_response": "",
        "is_completed": False,
    }

    config = {"configurable": {"thread_id": thread_id}}
    result = await agent_app.ainvoke(initial_state, config=config)

    return ChatMessageResponse(
        run_id=run_id,
        thread_id=thread_id,
        response=result.get("final_response", ""),
        plan=result.get("plan", []),
        retrieved_evidence=result.get("retrieved_evidence", {}),
        policy_citations=result.get("policy_citations", []),
        proposed_action=result.get("proposed_action"),
        jev_evaluation=result.get("jev_evaluation"),
        rule_evaluation=result.get("rule_evaluation"),
        approval_required=result.get("approval_required", False),
        approval_id=result.get("approval_id"),
        status="WAITING_APPROVAL" if result.get("approval_required") else "COMPLETED",
    )
